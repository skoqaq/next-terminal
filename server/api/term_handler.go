package api

import (
	"context"
	"sync"
	"time"
	"unicode/utf8"

	"next-terminal/server/dto"
	"next-terminal/server/global/session"
	"next-terminal/server/term"

	"github.com/gorilla/websocket"
)

type TermHandler struct {
	sessionId    string
	isRecording  bool
	webSocket    *websocket.Conn
	nextTerminal *term.NextTerminal
	ctx          context.Context
	cancel       context.CancelFunc
	dataChan     chan rune
	tick         *time.Ticker
	mutex        sync.Mutex
}

func NewTermHandler(sessionId string, isRecording bool, ws *websocket.Conn, nextTerminal *term.NextTerminal) *TermHandler {
	ctx, cancel := context.WithCancel(context.Background())
	tick := time.NewTicker(time.Millisecond * time.Duration(60))
	return &TermHandler{
		sessionId:    sessionId,
		isRecording:  isRecording,
		webSocket:    ws,
		nextTerminal: nextTerminal,
		ctx:          ctx,
		cancel:       cancel,
		dataChan:     make(chan rune),
		tick:         tick,
	}
}

func (r *TermHandler) Start() {
	go r.readFormTunnel()
	go r.writeToWebsocket()
}

func (r *TermHandler) Stop() {
	r.tick.Stop()
	r.cancel()
}

func (r *TermHandler) readFormTunnel() {
	for {
		select {
		case <-r.ctx.Done():
			return
		default:
			rn, size, err := r.nextTerminal.StdoutReader.ReadRune()
			if err != nil {
				return
			}
			if size > 0 {
				r.dataChan <- rn
			}
		}
	}
}

func (r *TermHandler) writeToWebsocket() {
	var buf []byte
	for {
		select {
		case <-r.ctx.Done():
			return
		case <-r.tick.C:
			if len(buf) > 0 {
				s := string(buf)
				if err := r.WriteMessage(dto.NewMessage(Data, s)); err != nil {
					return
				}
				// 录屏
				if r.isRecording {
					_ = r.nextTerminal.Recorder.WriteData(s)
				}
				// 监控
				SendObData(r.sessionId, s)
				buf = []byte{}
			}
		case data := <-r.dataChan:
			if data != utf8.RuneError {
				p := make([]byte, utf8.RuneLen(data))
				utf8.EncodeRune(p, data)
				buf = append(buf, p...)
			} else {
				buf = append(buf, []byte("@")...)
			}
		}
	}
}

func (r *TermHandler) WriteMessage(msg dto.Message) error {
	if r.webSocket == nil {
		return nil
	}
	defer r.mutex.Unlock()
	r.mutex.Lock()
	message := []byte(msg.ToString())
	return r.webSocket.WriteMessage(websocket.TextMessage, message)
}

func SendObData(sessionId, s string) {
	nextSession := session.GlobalSessionManager.GetById(sessionId)
	if nextSession != nil && nextSession.Observer != nil {
		nextSession.Observer.Range(func(key string, ob *session.Session) {
			_ = ob.WriteMessage(dto.NewMessage(Data, s))
		})
	}
}
