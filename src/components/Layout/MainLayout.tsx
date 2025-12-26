import React, { useState, useEffect } from "react";
import { Outlet, useNavigate, useLocation } from "react-router-dom";
import {
  Layout,
  Menu,
  Button,
  Avatar,
  Dropdown,
  Typography,
  Space,
  theme,
  Badge,
  Popover,
  Tabs,
  List,
  Tag,
  Empty,
} from "antd";
import {
  DashboardOutlined,
  TableOutlined,
  LineChartOutlined,
  SafetyOutlined,
  LogoutOutlined,
  UserOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  BellOutlined,
  CheckCircleOutlined,
  ClockCircleOutlined,
  ExclamationCircleOutlined,
  InfoCircleOutlined,
} from "@ant-design/icons";
import { message } from "antd";
import { BarChart3, PieChart, TrendingUp } from "lucide-react";
import { getCurrentUser, logout } from "../../services/authService";
import type { MenuProps } from "antd";

const { Header, Sider, Content } = Layout;
const { Title } = Typography;

// 通知消息类型
interface Notification {
  id: number;
  title: string;
  content: string;
  type: "info" | "warning" | "success" | "error";
  time: string;
  read: boolean;
}

const MainLayout: React.FC = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState<Notification[]>([
    {
      id: 1,
      title: "系统更新通知",
      content: "系统将于今晚23:00-24:00进行维护升级，请提前保存您的工作。",
      type: "info",
      time: "2025-12-23 10:30",
      read: false,
    },
    {
      id: 2,
      title: "风险预警",
      content: "您的投资组合中科技板块占比超过30%，建议适当调整配置。",
      type: "warning",
      time: "2025-12-23 09:15",
      read: false,
    },
    {
      id: 3,
      title: "交易成功",
      content: "您的股票AAPL已成功卖出，成交金额$15,000。",
      type: "success",
      time: "2025-12-22 14:45",
      read: true,
    },
    {
      id: 4,
      title: "数据同步完成",
      content: "您的投资数据已成功同步到云端，最新数据已更新。",
      type: "success",
      time: "2025-12-22 11:20",
      read: true,
    },
    {
      id: 5,
      title: "登录异常提醒",
      content: "检测到您的账户在异地登录，如非本人操作请立即修改密码。",
      type: "error",
      time: "2025-12-21 18:05",
      read: false,
    },
    {
      id: 6,
      title: "月度报告已生成",
      content: "您的11月份投资报告已生成，请及时查看。",
      type: "info",
      time: "2025-12-21 09:00",
      read: false,
    },
    {
      id: 7,
      title: "投资建议",
      content: "根据市场分析，建议关注新能源板块的投资机会。",
      type: "info",
      time: "2025-12-20 15:30",
      read: true,
    },
    {
      id: 8,
      title: "账户安全提醒",
      content: "您的密码已使用超过90天，建议定期更换密码以确保账户安全。",
      type: "warning",
      time: "2025-12-20 10:00",
      read: true,
    },
  ]);
  const [notificationVisible, setNotificationVisible] = useState(false);
  const [activeTab, setActiveTab] = useState("unread");
  const user = getCurrentUser();
  const navigate = useNavigate();
  const location = useLocation();
  const {
    token: { colorBgContainer, borderRadiusLG },
  } = theme.useToken();

  useEffect(() => {
    if (!user) {
      navigate("/login");
    }
  }, [user, navigate]);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  // 获取未读消息数量
  const unreadCount = notifications.filter((n) => !n.read).length;

  // 标记消息为已读
  const markAsRead = (id: number) => {
    setNotifications(
      notifications.map((n) => (n.id === id ? { ...n, read: true } : n))
    );
  };

  // 标记所有消息为已读
  const markAllAsRead = () => {
    setNotifications(notifications.map((n) => ({ ...n, read: true })));
    message.success("所有消息已标记为已读");
  };

  // 获取当前tab的消息列表
  const getCurrentNotifications = () => {
    if (activeTab === "unread") {
      return notifications.filter((n) => !n.read);
    } else {
      return notifications.filter((n) => n.read);
    }
  };

  // 获取消息类型图标
  const getNotificationIcon = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return <CheckCircleOutlined style={{ color: "#52c41a" }} />;
      case "warning":
        return <ExclamationCircleOutlined style={{ color: "#faad14" }} />;
      case "error":
        return <ExclamationCircleOutlined style={{ color: "#ff4d4f" }} />;
      case "info":
      default:
        return <InfoCircleOutlined style={{ color: "#1890ff" }} />;
    }
  };

  // 获取消息类型标签颜色
  const getNotificationTagColor = (type: Notification["type"]) => {
    switch (type) {
      case "success":
        return "success";
      case "warning":
        return "warning";
      case "error":
        return "error";
      case "info":
      default:
        return "processing";
    }
  };

  // 通知悬浮框内容
  const notificationContent = (
    <div style={{ width: 400 }}>
      <Tabs
        activeKey={activeTab}
        onChange={setActiveTab}
        items={[
          {
            key: "unread",
            label: (
              <span>
                未读
                {unreadCount > 0 && (
                  <Badge
                    count={unreadCount}
                    size="small"
                    style={{ marginLeft: 8 }}
                  />
                )}
              </span>
            ),
          },
          {
            key: "read",
            label: "已读",
          },
        ]}
      />

      <div style={{ maxHeight: 400, overflowY: "auto" }}>
        <List
          dataSource={getCurrentNotifications()}
          locale={{
            emptyText: (
              <Empty
                image={Empty.PRESENTED_IMAGE_SIMPLE}
                description={
                  activeTab === "unread" ? "暂无未读消息" : "暂无已读消息"
                }
              />
            ),
          }}
          renderItem={(item) => (
            <List.Item
              key={item.id}
              style={{
                padding: "12px 0",
                borderBottom: "1px solid #f0f0f0",
                cursor: "pointer",
                backgroundColor: !item.read ? "#f6ffed" : "transparent",
              }}
              onClick={() => markAsRead(item.id)}
            >
              <List.Item.Meta
                avatar={getNotificationIcon(item.type)}
                title={
                  <div
                    style={{
                      display: "flex",
                      justifyContent: "space-between",
                      alignItems: "center",
                    }}
                  >
                    <span style={{ fontWeight: item.read ? "normal" : "bold" }}>
                      {item.title}
                    </span>
                    <Tag
                      color={getNotificationTagColor(item.type)}
                      style={{ fontSize: "12px" }}
                    >
                      {item.type === "success"
                        ? "成功"
                        : item.type === "warning"
                        ? "警告"
                        : item.type === "error"
                        ? "错误"
                        : "信息"}
                    </Tag>
                  </div>
                }
                description={
                  <div>
                    <div style={{ marginBottom: 4 }}>{item.content}</div>
                    <div style={{ fontSize: 12, color: "#999" }}>
                      <ClockCircleOutlined style={{ marginRight: 4 }} />
                      {item.time}
                      {!item.read && (
                        <Tag
                          color="blue"
                          style={{ fontSize: "12px", marginLeft: 8 }}
                        >
                          未读
                        </Tag>
                      )}
                    </div>
                  </div>
                }
              />
            </List.Item>
          )}
        />
      </div>

      {activeTab === "unread" && unreadCount > 0 && (
        <div
          style={{
            textAlign: "center",
            padding: "12px 0",
            borderTop: "1px solid #f0f0f0",
            marginTop: 12,
          }}
        >
          <Button type="link" size="small" onClick={markAllAsRead}>
            标记全部为已读
          </Button>
        </div>
      )}
    </div>
  );

  const menuItems: MenuProps["items"] = [
    {
      key: "/dashboard",
      icon: <DashboardOutlined />,
      label: "资产总览",
    },
    {
      key: "/data-grid",
      icon: <TableOutlined />,
      label: "持仓明细",
    },
    {
      key: "/charts-analysis",
      icon: <LineChartOutlined />,
      label: "数据分析",
      children: [
        {
          key: "/trend-analysis",
          icon: <TrendingUp size={16} />,
          label: "趋势分析",
        },
        {
          key: "/asset-distribution",
          icon: <PieChart size={16} />,
          label: "资产分布",
        },
      ],
    },
    // 只有管理员可以看到风险管理页面
    ...(user?.role === "admin"
      ? [
          {
            key: "/risk-management",
            icon: <SafetyOutlined />,
            label: "风险管理",
          },
        ]
      : []),
  ];

  const userMenuItems: MenuProps["items"] = [
    {
      key: "/profile",
      icon: <UserOutlined />,
      label: "个人资料",
      onClick: () => navigate("/profile"),
    },
    {
      type: "divider",
    },
    {
      key: "logout",
      icon: <LogoutOutlined />,
      label: "退出登录",
      danger: true,
      onClick: handleLogout,
    },
  ];

  const handleMenuClick = (e: { key: string }) => {
    navigate(e.key);
  };

  const selectedKeys = [location.pathname];
  const openKeys = collapsed ? [] : ["/charts-analysis"];

  return (
    <Layout style={{ minHeight: "100vh" }}>
      <Sider
        trigger={null}
        collapsible
        collapsed={collapsed}
        width={250}
        style={{
          background: colorBgContainer,
          borderRight: "1px solid #f0f0f0",
          overflow: "auto",
          height: "100vh",
          position: "fixed",
          left: 0,
          top: 0,
          bottom: 0,
        }}
      >
        <div
          style={{
            padding: collapsed ? "16px 8px" : "24px 16px",
            borderBottom: "1px solid #f0f0f0",
            textAlign: collapsed ? "center" : "left",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              justifyContent: collapsed ? "center" : "flex-start",
              gap: 12,
            }}
          >
            {/* <div
              style={{
                width: 40,
                height: 40,
                borderRadius: 8,
                background: "linear-gradient(135deg, #1890ff 0%, #52c41a 100%)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <BarChart3 size={24} color="white" />
            </div> */}
            {!collapsed && (
              <Title level={4} style={{ margin: 0 }}>
                网新恒天金融资产数据分析及展示平台
              </Title>
            )}
          </div>
        </div>

        <Menu
          mode="inline"
          selectedKeys={selectedKeys}
          defaultOpenKeys={openKeys}
          items={menuItems}
          onClick={handleMenuClick}
          style={{
            borderRight: 0,
            marginTop: 16,
            fontSize: 14,
          }}
        />
      </Sider>

      <Layout
        style={{ marginLeft: collapsed ? 80 : 250, transition: "all 0.2s" }}
      >
        <Header
          style={{
            padding: "0 24px",
            background: colorBgContainer,
            borderBottom: "1px solid #f0f0f0",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
            position: "sticky",
            top: 0,
            zIndex: 1,
          }}
        >
          <div style={{ display: "flex", alignItems: "center", gap: 16 }}>
            <Button
              type="text"
              icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
              onClick={() => setCollapsed(!collapsed)}
              style={{ fontSize: 16 }}
            />
            <div>
              <Title level={4} style={{ margin: 0 }}>
                {(() => {
                  const menuItem = menuItems.find(
                    (item) =>
                      item && "key" in item && item.key === location.pathname
                  );
                  return (
                    menuItem && "label" in menuItem
                      ? menuItem.label
                      : "网新恒天金融资产数据分析及展示平台"
                  ) as string;
                })()}
              </Title>
            </div>
          </div>

          <Space size="large">
            <Popover
              content={notificationContent}
              title="消息通知"
              trigger="click"
              placement="bottomRight"
              open={notificationVisible}
              onOpenChange={setNotificationVisible}
            >
              <Badge count={unreadCount} size="small">
                <Button
                  type="text"
                  icon={<BellOutlined />}
                  onClick={() => setNotificationVisible(!notificationVisible)}
                />
              </Badge>
            </Popover>

            <Dropdown menu={{ items: userMenuItems }} placement="bottomRight">
              <Space
                style={{
                  cursor: "pointer",
                  padding: "0px 12px",
                  borderRadius: 8,
                }}
              >
                <Avatar
                  src={user?.avatar}
                  icon={!user?.avatar && <UserOutlined />}
                  size="default"
                />
                {!collapsed && (
                  <div>
                    <div style={{ fontSize: 12, color: "#999" }}>
                      {user?.role === "admin" ? "管理员" : "普通用户"}
                    </div>
                  </div>
                )}
              </Space>
            </Dropdown>
          </Space>
        </Header>

        <Content
          style={{
            margin: "24px 16px",
            padding: 24,
            background: colorBgContainer,
            borderRadius: borderRadiusLG,
            minHeight: 280,
            overflow: "auto",
          }}
        >
          <Outlet />
        </Content>

        <div
          style={{
            padding: "16px 24px",
            textAlign: "center",
            borderTop: "1px solid #f0f0f0",
            background: colorBgContainer,
            fontSize: 12,
            color: "#999",
          }}
        >
          <Space direction="vertical" size="small">
            <div>
              恒天金融资产数据分析及展示系统 © {new Date().getFullYear()}{" "}
              版权所有
            </div>
            <div>版本 1.0.0 | 数据更新于 {new Date().toLocaleDateString()}</div>
          </Space>
        </div>
      </Layout>
    </Layout>
  );
};

export default MainLayout;
