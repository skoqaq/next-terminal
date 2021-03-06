import React, {Component} from 'react';

import {
    Badge,
    Button,
    Col,
    Divider,
    Drawer,
    Dropdown,
    Form,
    Input,
    Layout,
    Menu,
    Modal,
    Row,
    Space,
    Switch,
    Table,
    Tag,
    Tooltip,
    Typography,
} from "antd";
import qs from "qs";
import UserModal from "./UserModal";
import request from "../../common/request";
import {message} from "antd/es";
import {
    DeleteOutlined,
    DownOutlined,
    ExclamationCircleOutlined, FrownOutlined,
    InsuranceOutlined,
    LockOutlined,
    PlusOutlined,
    SyncOutlined,
    UndoOutlined
} from '@ant-design/icons';
import {getCurrentUser} from "../../service/permission";
import dayjs from "dayjs";
import UserShareSelectedAsset from "./UserShareSelectedAsset";

const confirm = Modal.confirm;
const {Search} = Input;
const {Title, Text} = Typography;
const {Content} = Layout;

class User extends Component {

    inputRefOfNickname = React.createRef();
    inputRefOfUsername = React.createRef();
    inputRefOfMail = React.createRef();
    changePasswordFormRef = React.createRef()

    state = {
        items: [],
        total: 0,
        queryParams: {
            pageIndex: 1,
            pageSize: 10
        },
        loading: false,
        modalVisible: false,
        modalTitle: '',
        modalConfirmLoading: false,
        model: null,
        selectedRowKeys: [],
        delBtnLoading: false,
        assetVisible: false,
        changePasswordVisible: false,
        changePasswordConfirmLoading: false,
        selectedRow: {}
    };

    componentDidMount() {
        this.loadTableData();
    }

    async loadTableData(queryParams) {
        this.setState({
            loading: true
        });

        queryParams = queryParams || this.state.queryParams;

        let paramsStr = qs.stringify(queryParams);

        let data = {
            items: [],
            total: 0
        };

        try {
            let result = await request.get('/users/paging?' + paramsStr);
            if (result.code === 1) {
                data = result.data;
            } else {
                message.error(result.message, 10);
            }
        } finally {
            this.setState({
                items: data.items,
                total: data.total,
                queryParams: queryParams,
                loading: false
            });
        }

    }

    handleChangPage = (pageIndex, pageSize) => {
        let queryParams = this.state.queryParams;
        queryParams.pageIndex = pageIndex;
        queryParams.pageSize = pageSize;

        this.setState({
            queryParams: queryParams
        });

        this.loadTableData(queryParams);
    };

    showDeleteConfirm(id, content, index) {
        let self = this;
        confirm({
            title: '???????????????????????????????',
            content: content,
            okText: '??????',
            okType: 'danger',
            cancelText: '??????',
            onOk() {
                self.delete(id, index);
            }
        });
    };

    showModal(title, user = {}) {
        this.setState({
            model: user,
            modalVisible: true,
            modalTitle: title
        });
    };

    handleCancelModal = () => {
        this.setState({
            modalVisible: false,
            modalTitle: ''
        });
    };

    handleOk = async (formData) => {
        // ?????? form ???????????????
        this.setState({
            modalConfirmLoading: true
        });
        if (formData.id) {
            // ?????????????????????
            const result = await request.put('/users/' + formData.id, formData);
            if (result.code === 1) {
                message.success('????????????', 3);

                this.setState({
                    modalVisible: false
                });
                await this.loadTableData(this.state.queryParams);
            } else {
                message.error(result.message, 10);
            }
        } else {
            // ?????????????????????
            const result = await request.post('/users', formData);
            if (result.code === 1) {
                message.success('????????????', 3);

                this.setState({
                    modalVisible: false
                });
                await this.loadTableData(this.state.queryParams);
            } else {
                message.error(result.message, 10);
            }
        }

        this.setState({
            modalConfirmLoading: false
        });
    };

    handleSearchByUsername = username => {
        let query = {
            ...this.state.queryParams,
            'pageIndex': 1,
            'pageSize': this.state.queryParams.pageSize,
            'username': username,
        }

        this.loadTableData(query);
    };

    handleSearchByNickname = nickname => {
        let query = {
            ...this.state.queryParams,
            'pageIndex': 1,
            'pageSize': this.state.queryParams.pageSize,
            'nickname': nickname,
        }

        this.loadTableData(query);
    };

    handleSearchByMail = mail => {
        let query = {
            ...this.state.queryParams,
            'pageIndex': 1,
            'pageSize': this.state.queryParams.pageSize,
            'mail': mail,
        }

        this.loadTableData(query);
    };

    batchDelete = async () => {
        this.setState({
            delBtnLoading: true
        })
        try {
            let result = await request.delete('/users/' + this.state.selectedRowKeys.join(','));
            if (result['code'] === 1) {
                message.success('????????????', 3);
                this.setState({
                    selectedRowKeys: []
                })
                await this.loadTableData(this.state.queryParams);
            } else {
                message.error(result['message'], 10);
            }
        } finally {
            this.setState({
                delBtnLoading: false
            })
        }
    }

    handleChangePassword = async (values) => {
        this.setState({
            changePasswordConfirmLoading: true
        })

        let formData = new FormData();
        formData.append('password', values['password']);
        let result = await request.post(`/users/${this.state.selectedRow['id']}/change-password`, formData);
        if (result['code'] === 1) {
            message.success('????????????', 3);
        } else {
            message.error(result['message'], 10);
        }

        this.setState({
            changePasswordConfirmLoading: false,
            changePasswordVisible: false
        })
    }

    handleTableChange = (pagination, filters, sorter) => {
        let query = {
            ...this.state.queryParams,
            'order': sorter.order,
            'field': sorter.field
        }

        this.loadTableData(query);
    }

    async delete(id, index) {
        let items = this.state.items;
        try {
            items[index]['delLoading'] = true;
            this.setState({
                items: items
            });
            let result = await request.delete('/users/' + id);
            if (result.code === 1) {
                message.success('????????????', 3);
                this.loadTableData(this.state.queryParams);
            } else {
                message.error(result.message, 10);
            }
        } finally {
            items[index]['delLoading'] = false;
            this.setState({
                items: items
            });
        }
    }

    changeUserStatus = async (id, checked, index) => {
        let items = this.state.items;
        try {
            items[index]['statusLoading'] = true;
            this.setState({
                items: items
            });
            let result = await request.patch(`/users/${id}/status?status=${checked ? 'enabled' : 'disabled'}`);
            if (result['code'] !== 1) {
                message.error(result['message']);
                return
            }
            this.loadTableData(this.state.queryParams);
        } finally {
            items[index]['statusLoading'] = false;
            this.setState({
                items: items
            });
        }
    }

    resetTOTP = async (id, index) => {
        let items = this.state.items;
        try {
            items[index]['resetTOTPLoading'] = true;
            this.setState({
                items: items
            });
            let result = await request.post(`/users/${id}/reset-totp`);
            if (result['code'] === 1) {
                message.success('????????????', 3);
                this.loadTableData();
            } else {
                message.error(result['message'], 10);
            }
        } finally {
            items[index]['resetTOTPLoading'] = false;
            this.setState({
                items: items
            });
        }

    }

    render() {

        const columns = [{
            title: '??????',
            dataIndex: 'id',
            key: 'id',
            render: (id, record, index) => {
                return index + 1;
            }
        }, {
            title: '????????????',
            dataIndex: 'username',
            key: 'username',
            sorter: true,
            render: (username, record) => {
                return (
                    <Button type="link" size='small'
                            onClick={async () => {
                                let result = await request.get(`/users/${record['id']}`);
                                if (result['code'] !== 1) {
                                    message.error(result['message']);
                                    return;
                                }
                                this.showModal('????????????', result['data']);
                            }}>{username}</Button>
                );
            }
        }, {
            title: '????????????',
            dataIndex: 'nickname',
            key: 'nickname',
            sorter: true,
        }, {
            title: '????????????',
            dataIndex: 'type',
            key: 'type',
            render: (text) => {

                if (text === 'user') {
                    return (
                        <Tag>????????????</Tag>
                    );
                } else if (text === 'admin') {
                    return (
                        <Tag color="blue">????????????</Tag>
                    );
                } else {
                    return text;
                }
            }
        }, {
            title: '??????',
            dataIndex: 'mail',
            key: 'mail',
        }, {
            title: '??????',
            dataIndex: 'status',
            key: 'status',
            render: (status, record, index) => {
                return <Switch checkedChildren="??????" unCheckedChildren="??????"
                               disabled={getCurrentUser()['id'] === record['id']}
                               loading={record['statusLoading']}
                               checked={status !== 'disabled'}
                               onChange={checked => {
                                   this.changeUserStatus(record['id'], checked, index);
                               }}/>
            }
        }, {
            title: '???????????????',
            dataIndex: 'totpSecret',
            key: 'totpSecret',
            render: (text) => {

                if (text === '1') {
                    return <Tag icon={<InsuranceOutlined/>} color="success">?????????</Tag>;
                } else {
                    return <Tag icon={<FrownOutlined />} color="warning">?????????</Tag>;
                }
            }
        }, {
            title: '????????????',
            dataIndex: 'online',
            key: 'online',
            render: text => {
                if (text) {
                    return (<Badge status="success" text="??????"/>);
                } else {
                    return (<Badge status="default" text="??????"/>);
                }
            }
        }, {
            title: '????????????',
            dataIndex: 'sharerAssetCount',
            key: 'sharerAssetCount',
            render: (text, record) => {
                return <Button type='link' onClick={async () => {
                    this.setState({
                        assetVisible: true,
                        sharer: record['id']
                    })
                }}>{text}</Button>
            }
        }, {
            title: '????????????',
            dataIndex: 'created',
            key: 'created',
            render: (text) => {
                return (
                    <Tooltip title={text}>
                        {dayjs(text).fromNow()}
                    </Tooltip>
                )
            },
            sorter: true,
        }, {
            title: '??????',
            dataIndex: 'source',
            key: 'source',
            render: (text) => {
                if (text === 'ldap') {
                    return (
                        <Tag color="gold">?????????</Tag>
                    );
                }
            }
        },
            {
                title: '??????',
                key: 'action',
                render: (text, record, index) => {

                    const menu = (
                        <Menu>
                            <Menu.Item key="1">
                                <Button type="text" size='small'
                                        disabled={record['source'] === 'ldap'}
                                        onClick={() => {
                                            this.setState({
                                                changePasswordVisible: true,
                                                selectedRow: record
                                            })
                                        }}>????????????</Button>
                            </Menu.Item>

                            <Menu.Item key="2">
                                <Button type="text" size='small'
                                        loading={record['resetTOTPLoading']}
                                        onClick={() => {
                                            confirm({
                                                title: '?????????????????????????????????????????????????',
                                                content: record['name'],
                                                okText: '??????',
                                                cancelText: '??????',
                                                onOk: async () => {
                                                    this.resetTOTP(record['id'], index);
                                                }
                                            });
                                        }}>?????????????????????</Button>
                            </Menu.Item>

                            <Menu.Item key="3">
                                <Button type="text" size='small'
                                        onClick={() => {
                                            this.setState({
                                                assetVisible: true,
                                                sharer: record['id']
                                            })
                                        }}>????????????</Button>
                            </Menu.Item>

                            <Menu.Divider/>
                            <Menu.Item key="5">
                                <Button type="text" size='small' danger
                                        disabled={getCurrentUser()['id'] === record['id']}
                                        loading={record['delLoading']}
                                        onClick={() => this.showDeleteConfirm(record.id, record.name, index)}>??????</Button>
                            </Menu.Item>
                        </Menu>
                    );

                    return (
                        <div>
                            <Button type="link" size='small'
                                    disabled={getCurrentUser()['id'] === record['id']}
                                    onClick={async () => {
                                        let result = await request.get(`/users/${record['id']}`);
                                        if (result['code'] !== 1) {
                                            message.error(result['message']);
                                            return;
                                        }
                                        this.showModal('????????????', result['data']);
                                    }}>??????</Button>
                            <Dropdown overlay={menu}>
                                <Button type="link" size='small'>
                                    ?????? <DownOutlined/>
                                </Button>
                            </Dropdown>
                        </div>
                    )
                },
            }
        ];

        const selectedRowKeys = this.state.selectedRowKeys;
        const rowSelection = {
            selectedRowKeys: this.state.selectedRowKeys,
            onChange: (selectedRowKeys) => {
                this.setState({selectedRowKeys});
            },
        };
        const hasSelected = selectedRowKeys.length > 0;

        return (
            <>
                <Content className="site-layout-background page-content">
                    <div style={{marginBottom: 20}}>
                        <Row justify="space-around" align="middle" gutter={24}>
                            <Col span={8} key={1}>
                                <Title level={3}>????????????</Title>
                            </Col>
                            <Col span={16} key={2} style={{textAlign: 'right'}}>
                                <Space>

                                    <Search
                                        ref={this.inputRefOfNickname}
                                        placeholder="????????????"
                                        allowClear
                                        onSearch={this.handleSearchByNickname}
                                    />

                                    <Search
                                        ref={this.inputRefOfUsername}
                                        placeholder="????????????"
                                        allowClear
                                        onSearch={this.handleSearchByUsername}
                                    />

                                    <Search
                                        ref={this.inputRefOfMail}
                                        placeholder="??????"
                                        allowClear
                                        onSearch={this.handleSearchByMail}
                                    />

                                    <Tooltip title='????????????'>

                                        <Button icon={<UndoOutlined/>} onClick={() => {
                                            this.inputRefOfUsername.current.setValue('');
                                            this.inputRefOfNickname.current.setValue('');
                                            this.inputRefOfMail.current.setValue('');
                                            this.loadTableData({pageIndex: 1, pageSize: 10})
                                        }}>

                                        </Button>
                                    </Tooltip>

                                    <Divider type="vertical"/>

                                    <Tooltip title="??????">
                                        <Button type="dashed" icon={<PlusOutlined/>}
                                                onClick={() => this.showModal('????????????', {})}>

                                        </Button>
                                    </Tooltip>

                                    <Tooltip title="????????????">
                                        <Button icon={<SyncOutlined/>} onClick={() => {
                                            this.loadTableData(this.state.queryParams)
                                        }}>

                                        </Button>
                                    </Tooltip>

                                    <Tooltip title="????????????">
                                        <Button type="primary" danger disabled={!hasSelected} icon={<DeleteOutlined/>}
                                                loading={this.state.delBtnLoading}
                                                onClick={() => {
                                                    const content = <div>
                                                        ???????????????????????????<Text style={{color: '#1890FF'}}
                                                                       strong>{this.state.selectedRowKeys.length}</Text>???????????????
                                                    </div>;
                                                    confirm({
                                                        icon: <ExclamationCircleOutlined/>,
                                                        content: content,
                                                        onOk: () => {
                                                            this.batchDelete()
                                                        },
                                                        onCancel() {

                                                        },
                                                    });
                                                }}>

                                        </Button>
                                    </Tooltip>

                                </Space>
                            </Col>
                        </Row>
                    </div>

                    <Table rowSelection={rowSelection}
                           rowKey='id'
                           dataSource={this.state.items}
                           columns={columns}
                           position={'both'}
                           pagination={{
                               showSizeChanger: true,
                               current: this.state.queryParams.pageIndex,
                               pageSize: this.state.queryParams.pageSize,
                               onChange: this.handleChangPage,
                               onShowSizeChange: this.handleChangPage,
                               total: this.state.total,
                               showTotal: total => `?????? ${total} ???`
                           }}
                           loading={this.state.loading}
                           onChange={this.handleTableChange}
                    />

                    {/* ????????????ant modal ????????????????????????????????????*/}
                    {
                        this.state.modalVisible ?
                            <UserModal
                                visible={this.state.modalVisible}
                                title={this.state.modalTitle}
                                handleOk={this.handleOk}
                                handleCancel={this.handleCancelModal}
                                confirmLoading={this.state.modalConfirmLoading}
                                model={this.state.model}
                            >
                            </UserModal> : undefined
                    }

                    <Drawer
                        title="????????????"
                        placement="right"
                        closable={true}
                        destroyOnClose={true}
                        onClose={() => {
                            this.loadTableData(this.state.queryParams);
                            this.setState({
                                assetVisible: false
                            })
                        }}
                        visible={this.state.assetVisible}
                        width={window.innerWidth * 0.8}
                    >
                        <UserShareSelectedAsset
                            sharer={this.state.sharer}
                            userGroupId={undefined}
                        >
                        </UserShareSelectedAsset>
                    </Drawer>

                    {
                        this.state.changePasswordVisible ?
                            <Modal title="????????????" visible={this.state.changePasswordVisible}
                                   confirmLoading={this.state.changePasswordConfirmLoading}
                                   maskClosable={false}
                                   onOk={() => {
                                       this.changePasswordFormRef.current
                                           .validateFields()
                                           .then(values => {
                                               this.changePasswordFormRef.current.resetFields();
                                               this.handleChangePassword(values);
                                           });
                                   }}
                                   onCancel={() => {
                                       this.setState({
                                           changePasswordVisible: false
                                       })
                                   }}>

                                <Form ref={this.changePasswordFormRef}>

                                    <Form.Item name='password' rules={[{required: true, message: '??????????????????'}]}>
                                        <Input prefix={<LockOutlined/>} placeholder="??????????????????"/>
                                    </Form.Item>
                                </Form>
                            </Modal> : undefined
                    }

                </Content>
            </>
        );
    }
}

export default User;
