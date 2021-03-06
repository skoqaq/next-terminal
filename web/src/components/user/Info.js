import React, {Component} from 'react';
import {
    Button,
    Card,
    Col,
    Descriptions,
    Divider,
    Form,
    Image,
    Input,
    Layout,
    Modal,
    Result,
    Row,
    Space,
    Typography
} from "antd";
import request from "../../common/request";
import {message} from "antd/es";
import {ExclamationCircleOutlined, ReloadOutlined} from "@ant-design/icons";
import {isAdmin} from "../../service/permission";

const {Content} = Layout;
const {Meta} = Card;
const {Title, Text} = Typography;

const formItemLayout = {
    labelCol: {span: 4},
    wrapperCol: {span: 10},
};

const formTailLayout = {
    labelCol: {span: 4},
    wrapperCol: {span: 10, offset: 4},
};
const {confirm} = Modal;

class Info extends Component {

    state = {
        user: {
            enableTotp: false
        },
        accessToken: {}
    }

    passwordFormRef = React.createRef();

    componentDidMount() {
        this.loadInfo();
        this.loadAccessToken();
    }

    loadInfo = async () => {
        let result = await request.get('/account/info');
        if (result['code'] === 1) {
            this.setState({
                user: result['data']
            })
            sessionStorage.setItem('user', JSON.stringify(result['data']));
        } else {
            message.error(result['message']);
        }
    }

    loadAccessToken = async () => {
        let result = await request.get('/account/access-token');
        if (result['code'] === 1) {
            this.setState({
                accessToken: result['data']
            })
        } else {
            message.error(result['message']);
        }
    }

    genAccessToken = async () => {
        let result = await request.post('/account/access-token');
        if (result['code'] === 1) {
            this.loadAccessToken();
        } else {
            message.error(result['message']);
        }
    }

    onNewPasswordChange(value) {
        this.setState({
            'newPassword': value.target.value
        })
    }

    onNewPassword2Change = (value) => {
        this.setState({
            ...this.validateNewPassword(value.target.value),
            'newPassword2': value.target.value
        })
    }

    validateNewPassword = (newPassword2) => {
        if (newPassword2 === this.state.newPassword) {
            return {
                validateStatus: 'success',
                errorMsg: null,
            };
        }
        return {
            validateStatus: 'error',
            errorMsg: '??????????????????????????????',
        };
    }

    changePassword = async (values) => {
        let result = await request.post('/account/change-password', values);
        if (result.code === 1) {
            message.success('????????????????????????????????????????????????');
            window.location.href = '/#';
        } else {
            message.error(result.message);
        }
    }

    confirmTOTP = async (values) => {
        values['secret'] = this.state.secret
        let result = await request.post('/account/confirm-totp', values);
        if (result.code === 1) {
            message.success('TOTP????????????');
            await this.loadInfo();
            this.setState({
                qr: "",
                secret: ""
            })
        } else {
            message.error(result.message);
        }
    }

    resetTOTP = async () => {
        let result = await request.get('/account/reload-totp');
        if (result.code === 1) {
            this.setState({
                qr: result.data.qr,
                secret: result.data.secret,
            })
        } else {
            message.error(result.message);
        }
    }

    render() {
        let contentClassName = isAdmin() ? 'page-content' : 'page-content-user';
        return (
            <>
                <Content className={["site-layout-background", contentClassName]}>
                    <Row>
                        <Col span={12}>
                            <Title level={3}>????????????</Title>
                            <Form ref={this.passwordFormRef} name="password" onFinish={this.changePassword}>
                                <input type='password' hidden={true} autoComplete='new-password'/>
                                <Form.Item
                                    {...formItemLayout}
                                    name="oldPassword"
                                    label="????????????"
                                    rules={[
                                        {
                                            required: true,
                                            message: '????????????',
                                        },
                                    ]}
                                >
                                    <Input type='password' placeholder="?????????????????????" style={{width: 240}}/>
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    name="newPassword"
                                    label="????????????"
                                    rules={[
                                        {
                                            required: true,
                                            message: '?????????????????????',
                                        },
                                    ]}
                                >
                                    <Input type='password' placeholder="????????????"
                                           onChange={(value) => this.onNewPasswordChange(value)} style={{width: 240}}/>
                                </Form.Item>
                                <Form.Item
                                    {...formItemLayout}
                                    name="newPassword2"
                                    label="????????????"
                                    rules={[
                                        {
                                            required: true,
                                            message: '??????????????????????????????????????????',
                                        },
                                    ]}
                                    validateStatus={this.state.validateStatus}
                                    help={this.state.errorMsg || ' '}
                                >
                                    <Input type='password' placeholder="??????????????????????????????????????????"
                                           onChange={(value) => this.onNewPassword2Change(value)} style={{width: 240}}/>
                                </Form.Item>
                                <Form.Item {...formTailLayout}>
                                    <Button disabled={this.state.errorMsg || !this.state.validateStatus} type="primary" htmlType="submit">
                                        ??????
                                    </Button>
                                </Form.Item>
                            </Form>

                            <Divider/>
                        </Col>
                        <Col span={12}>
                            <Title level={3}>????????????</Title>
                            <Descriptions column={1}>
                                <Descriptions.Item label="????????????">
                                    <Text strong copyable>{this.state.accessToken.token}</Text>
                                </Descriptions.Item>
                                <Descriptions.Item label="????????????">
                                    <Text strong>{this.state.accessToken.created}</Text>
                                </Descriptions.Item>
                            </Descriptions>

                            <Space>
                                <Button type="primary" onClick={this.genAccessToken}>
                                    ????????????
                                </Button>
                            </Space>
                        </Col>
                    </Row>


                    <Title level={3}>???????????????</Title>
                    <Form hidden={this.state.qr}>
                        <Form.Item {...formItemLayout}>
                            {
                                this.state.user.enableTotp ?
                                    <Result
                                        status="success"
                                        title="?????????????????????????????????!"
                                        subTitle="???????????????-MFA????????????-??????????????????,????????????????????????"
                                        extra={[
                                            <Button type="primary" key="console" danger onClick={() => {
                                                confirm({
                                                    title: '???????????????????????????????????????',
                                                    icon: <ExclamationCircleOutlined/>,
                                                    content: '???????????????????????????????????????????????????????????????',
                                                    okText: '??????',
                                                    okType: 'danger',
                                                    cancelText: '??????',
                                                    onOk: async () => {
                                                        let result = await request.post('/account/reset-totp');
                                                        if (result.code === 1) {
                                                            message.success('???????????????????????????');
                                                            await this.loadInfo();
                                                        } else {
                                                            message.error(result.message);
                                                        }
                                                    },
                                                    onCancel() {
                                                        console.log('Cancel');
                                                    },
                                                })
                                            }}>
                                                ????????????
                                            </Button>,
                                            <Button key="re-bind" onClick={this.resetTOTP}>????????????</Button>,
                                        ]}
                                    /> :
                                    <Result
                                        status="warning"
                                        title="?????????????????????????????????"
                                        subTitle="?????????????????????????????????????????????"
                                        extra={
                                            <Button type="primary" key="bind" onClick={this.resetTOTP}>
                                                ?????????
                                            </Button>
                                        }
                                    />
                            }

                        </Form.Item>
                    </Form>

                    <Form hidden={!this.state.qr} onFinish={this.confirmTOTP}>
                        <Form.Item {...formItemLayout} label="?????????">
                            <Space size={12}>

                                <Card
                                    hoverable
                                    style={{width: 280}}
                                    cover={<Image
                                        style={{padding: 20}}
                                        width={280}
                                        src={"data:image/png;base64, " + this.state.qr}
                                    />
                                    }
                                >
                                    <Meta title="????????????????????????"
                                          description="?????????30????????????????????????????????????????????????Google Authenticator, Authy ?????? Microsoft Authenticator???"/>
                                </Card>

                                <Button
                                    type="primary"
                                    icon={<ReloadOutlined/>}
                                    onClick={this.resetTOTP}
                                >
                                    ????????????
                                </Button>
                            </Space>
                        </Form.Item>
                        <Form.Item
                            {...formItemLayout}
                            name="totp"
                            label="TOTP"
                            rules={[
                                {
                                    required: true,
                                    message: '????????????????????????APP?????????????????????',
                                },
                            ]}
                        >
                            <Input placeholder="????????????????????????APP?????????????????????"/>
                        </Form.Item>
                        <Form.Item {...formTailLayout}>
                            <Button type="primary" htmlType="submit">
                                ??????
                            </Button>
                        </Form.Item>
                    </Form>

                </Content>
            </>
        );
    }
}

export default Info;
