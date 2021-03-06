import React, {Component} from 'react';
import 'antd/dist/antd.css';
import './App.css';
import {Button, Dropdown, Layout, Menu, Popconfirm} from "antd";
import {Link, Route, Switch} from "react-router-dom";
import Dashboard from "./components/dashboard/Dashboard";
import Asset from "./components/asset/Asset";
import Access from "./components/access/Access";
import User from "./components/user/User";
import OnlineSession from "./components/session/OnlineSession";
import OfflineSession from "./components/session/OfflineSession";
import Login from "./components/Login";
import DynamicCommand from "./components/command/DynamicCommand";
import Credential from "./components/credential/Credential";
import LogoWithName from './images/logo-with-name.svg'
import Logo from './images/logo.svg'
import {
    ApiOutlined,
    AuditOutlined,
    BlockOutlined,
    CloudServerOutlined,
    CodeOutlined,
    ControlOutlined,
    DashboardOutlined,
    DesktopOutlined,
    DisconnectOutlined,
    DownOutlined,
    FolderOutlined,
    GithubOutlined,
    HddOutlined,
    IdcardOutlined,
    InsuranceOutlined,
    LinkOutlined,
    LoginOutlined,
    LogoutOutlined,
    MenuFoldOutlined,
    MenuUnfoldOutlined,
    SafetyCertificateOutlined,
    SettingOutlined,
    SolutionOutlined,
    TeamOutlined,
    UserOutlined,
    UserSwitchOutlined
} from '@ant-design/icons';
import Info from "./components/user/Info";
import request from "./common/request";
import {message} from "antd/es";
import Setting from "./components/setting/Setting";
import BatchCommand from "./components/command/BatchCommand";
import {isEmpty, NT_PACKAGE} from "./utils/utils";
import {getCurrentUser, isAdmin} from "./service/permission";
import UserGroup from "./components/user/UserGroup";
import LoginLog from "./components/devops/LoginLog";
import Term from "./components/access/Term";
import Job from "./components/devops/Job";
import {Header} from "antd/es/layout/layout";
import Security from "./components/devops/Security";
import Storage from "./components/devops/Storage";
import MyFile from "./components/asset/MyFile";
import Strategy from "./components/user/Strategy";
import AccessGateway from "./components/asset/AccessGateway";
import MyAsset from "./components/asset/MyAsset";

const {Footer, Content, Sider} = Layout;

const {SubMenu} = Menu;
const headerHeight = 60;

class App extends Component {

    state = {
        collapsed: false,
        current: sessionStorage.getItem('current'),
        openKeys: sessionStorage.getItem('openKeys') ? JSON.parse(sessionStorage.getItem('openKeys')) : [],
        user: {
            'nickname': '?????????'
        },
        package: NT_PACKAGE(),
        triggerMenu: true,
        logo: LogoWithName,
        logoWidth: 140
    };

    onCollapse = () => {
        let collapsed = !this.state.collapsed;
        if (collapsed) {
            this.setState({
                logo: Logo,
                logoWidth: 46,
                collapsed: collapsed,
            });
        } else {
            this.setState({
                logo: LogoWithName,
                logoWidth: 140,
                collapsed: collapsed,
            });
        }
    };

    componentDidMount() {
        let hash = window.location.hash;
        let current = hash.replace('#/', '');
        if (isEmpty(current)) {
            current = 'dashboard';
        }
        this.setCurrent(current);
        this.getInfo();
    }

    async getInfo() {

        let result = await request.get('/account/info');
        if (result['code'] === 1) {
            sessionStorage.setItem('user', JSON.stringify(result['data']));
            this.setState({
                user: result['data'],
                triggerMenu: true
            })
        } else {
            message.error(result['message']);
        }
    }

    updateUser = (user) => {
        this.setState({
            user: user
        })
    }

    setCurrent = (key) => {
        this.setState({
            current: key
        })
        sessionStorage.setItem('current', key);
    }

    subMenuChange = (openKeys) => {
        this.setState({
            openKeys: openKeys
        })
        sessionStorage.setItem('openKeys', JSON.stringify(openKeys));
    }

    confirm = async () => {
        let result = await request.post('/account/logout');
        if (result['code'] !== 1) {
            message.error(result['message']);
        } else {
            message.success('???????????????????????????????????????????????????');
            window.location.reload();
        }
    }

    render() {

        const menu = (
            <Menu>

                <Menu.Item>
                    <Link to={'/info'}>
                        <SolutionOutlined/> ????????????
                    </Link>
                </Menu.Item>
                <Menu.Divider/>

                <Menu.Item>

                    <Popconfirm
                        key='login-btn-pop'
                        title="????????????????????????????"
                        onConfirm={this.confirm}
                        okText="??????"
                        cancelText="??????"
                        placement="left"
                    >
                        <LogoutOutlined/> ????????????
                    </Popconfirm>
                </Menu.Item>

            </Menu>
        );

        return (

            <Switch>
                <Route path="/access" component={Access}/>
                <Route path="/term" component={Term}/>
                <Route path="/login"><Login updateUser={this.updateUser}/></Route>

                <Route path="/">
                    <Layout className="layout" style={{minHeight: '100vh'}}>

                        {
                            isAdmin() ?
                                <>
                                    <Sider collapsible collapsed={this.state.collapsed} trigger={null}>
                                        <div className="logo">
                                            <img src={this.state.logo} alt='logo' width={this.state.logoWidth}/>
                                        </div>

                                        <Menu
                                            onClick={(e) => this.setCurrent(e.key)}
                                            selectedKeys={[this.state.current]}
                                            onOpenChange={this.subMenuChange}
                                            defaultOpenKeys={this.state.openKeys}
                                            theme="dark" mode="inline" defaultSelectedKeys={['dashboard']}
                                            inlineCollapsed={this.state.collapsed}
                                            style={{lineHeight: '64px'}}>

                                            <Menu.Item key="dashboard" icon={<DashboardOutlined/>}>
                                                <Link to={'/'}>
                                                    ????????????
                                                </Link>
                                            </Menu.Item>

                                            <SubMenu key='resource' title='????????????' icon={<CloudServerOutlined/>}>
                                                <Menu.Item key="asset" icon={<DesktopOutlined/>}>
                                                    <Link to={'/asset'}>
                                                        ????????????
                                                    </Link>
                                                </Menu.Item>
                                                <Menu.Item key="credential" icon={<IdcardOutlined/>}>
                                                    <Link to={'/credential'}>
                                                        ????????????
                                                    </Link>
                                                </Menu.Item>
                                                <Menu.Item key="dynamic-command" icon={<CodeOutlined/>}>
                                                    <Link to={'/dynamic-command'}>
                                                        ????????????
                                                    </Link>
                                                </Menu.Item>
                                                <Menu.Item key="access-gateway" icon={<ApiOutlined/>}>
                                                    <Link to={'/access-gateway'}>
                                                        ????????????
                                                    </Link>
                                                </Menu.Item>
                                            </SubMenu>

                                            <SubMenu key='audit' title='????????????' icon={<AuditOutlined/>}>
                                                <Menu.Item key="online-session" icon={<LinkOutlined/>}>
                                                    <Link to={'/online-session'}>
                                                        ????????????
                                                    </Link>
                                                </Menu.Item>

                                                <Menu.Item key="offline-session" icon={<DisconnectOutlined/>}>
                                                    <Link to={'/offline-session'}>
                                                        ????????????
                                                    </Link>
                                                </Menu.Item>
                                            </SubMenu>
                                            <SubMenu key='ops' title='????????????' icon={<ControlOutlined/>}>
                                                <Menu.Item key="login-log" icon={<LoginOutlined/>}>
                                                    <Link to={'/login-log'}>
                                                        ????????????
                                                    </Link>
                                                </Menu.Item>

                                                <Menu.Item key="job" icon={<BlockOutlined/>}>
                                                    <Link to={'/job'}>
                                                        ????????????
                                                    </Link>
                                                </Menu.Item>

                                                <Menu.Item key="access-security" icon={<SafetyCertificateOutlined/>}>
                                                    <Link to={'/access-security'}>
                                                        ????????????
                                                    </Link>
                                                </Menu.Item>
                                                <Menu.Item key="storage" icon={<HddOutlined/>}>
                                                    <Link to={'/storage'}>
                                                        ????????????
                                                    </Link>
                                                </Menu.Item>
                                            </SubMenu>

                                            <SubMenu key='user-manage' title='????????????' icon={<UserSwitchOutlined/>}>
                                                <Menu.Item key="user" icon={<UserOutlined/>}>
                                                    <Link to={'/user'}>
                                                        ????????????
                                                    </Link>
                                                </Menu.Item>
                                                <Menu.Item key="user-group" icon={<TeamOutlined/>}>
                                                    <Link to={'/user-group'}>
                                                        ???????????????
                                                    </Link>
                                                </Menu.Item>
                                                <Menu.Item key="strategy" icon={<InsuranceOutlined/>}>
                                                    <Link to={'/strategy'}>
                                                        ????????????
                                                    </Link>
                                                </Menu.Item>
                                            </SubMenu>
                                            <Menu.Item key="my-file" icon={<FolderOutlined/>}>
                                                <Link to={'/my-file'}>
                                                    ????????????
                                                </Link>
                                            </Menu.Item>
                                            <Menu.Item key="info" icon={<SolutionOutlined/>}>
                                                <Link to={'/info'}>
                                                    ????????????
                                                </Link>
                                            </Menu.Item>
                                            <Menu.Item key="setting" icon={<SettingOutlined/>}>
                                                <Link to={'/setting'}>
                                                    ????????????
                                                </Link>
                                            </Menu.Item>
                                        </Menu>
                                    </Sider>

                                    <Layout className="site-layout">
                                        <Header className="site-layout-background"
                                                style={{padding: 0, height: headerHeight, zIndex: 20}}>
                                            <div className='layout-header'>
                                                <div className='layout-header-left'>
                                                    {React.createElement(this.state.collapsed ? MenuUnfoldOutlined : MenuFoldOutlined, {
                                                        className: 'trigger',
                                                        onClick: this.onCollapse,
                                                    })}
                                                </div>

                                                <div className='layout-header-right'>
                                                    <div className={'layout-header-right-item'}>
                                                        <a style={{color: 'black'}} target='_blank'
                                                           href='https://github.com/dushixiang/next-terminal'
                                                           rel='noreferrer noopener'>
                                                            <GithubOutlined/>
                                                        </a>
                                                    </div>
                                                </div>

                                                <div className='layout-header-right'>
                                                    <Dropdown overlay={menu}>
                                                        <div className='nickname layout-header-right-item'>
                                                            {getCurrentUser()['nickname']} &nbsp;<DownOutlined/>
                                                        </div>
                                                    </Dropdown>
                                                </div>
                                            </div>
                                        </Header>

                                        <Route path="/" exact component={Dashboard}/>
                                        <Route path="/user" component={User}/>
                                        <Route path="/user-group" component={UserGroup}/>
                                        <Route path="/asset" component={Asset}/>
                                        <Route path="/credential" component={Credential}/>
                                        <Route path="/dynamic-command" component={DynamicCommand}/>
                                        <Route path="/batch-command" component={BatchCommand}/>
                                        <Route path="/online-session" component={OnlineSession}/>
                                        <Route path="/offline-session" component={OfflineSession}/>
                                        <Route path="/login-log" component={LoginLog}/>
                                        <Route path="/info" component={Info}/>
                                        <Route path="/setting" component={Setting}/>
                                        <Route path="/job" component={Job}/>
                                        <Route path="/access-security" component={Security}/>
                                        <Route path="/access-gateway" component={AccessGateway}/>
                                        <Route path="/my-file" component={MyFile}/>
                                        <Route path="/storage" component={Storage}/>
                                        <Route path="/strategy" component={Strategy}/>

                                        <Footer style={{textAlign: 'center'}}>
                                            Copyright ?? 2020-2022 dushixiang, All Rights Reserved.
                                            Version:{this.state.package['version']}
                                        </Footer>
                                    </Layout>
                                </> :
                                <>
                                    <Header style={{padding: 0}}>
                                        <div className='km-header'>
                                            <div style={{flex: '1 1 0%'}}>
                                                <Link to={'/'}>
                                                    <img src={this.state.logo} alt='logo' width={120}/>
                                                </Link>

                                                <Link to={'/my-file'}>
                                                    <Button type="text" style={{color: 'white'}}
                                                            icon={<FolderOutlined/>}>
                                                        ??????
                                                    </Button>
                                                </Link>

                                                <Link to={'/dynamic-command'}>
                                                    <Button type="text" style={{color: 'white'}}
                                                            icon={<CodeOutlined/>}>
                                                        ??????
                                                    </Button>
                                                </Link>
                                            </div>
                                            <div className='km-header-right'>
                                                <Dropdown overlay={menu}>
                                                <span className={'km-header-right-item'}>
                                                    {getCurrentUser()['nickname']}
                                                </span>
                                                </Dropdown>
                                            </div>
                                        </div>
                                    </Header>
                                    <Content className='km-container'>
                                        <Layout>
                                            <Route path="/" exact component={MyAsset}/>
                                            <Content className={'kd-content'}>
                                                <Route path="/info" component={Info}/>
                                                <Route path="/my-file" component={MyFile}/>
                                                <Route path="/dynamic-command" component={DynamicCommand}/>
                                            </Content>
                                        </Layout>
                                    </Content>
                                    <Footer style={{textAlign: 'center'}}>
                                        Copyright ?? 2020-2022 dushixiang, All Rights Reserved.
                                        Version:{this.state.package['version']}
                                    </Footer>
                                </>
                        }


                    </Layout>
                </Route>
            </Switch>

        );
    }
}

export default App;
