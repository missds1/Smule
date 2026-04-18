import React, { useState, useEffect } from "react";
import { BrowserRouter as Router, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import { 
  Layout, Menu, Button, Input, Card, Row, Col, Typography, 
  Modal, Form, Popconfirm, Empty, Space, Tag, ConfigProvider, theme, message, ColorPicker
} from "antd";
import { 
  PlusOutlined, DeleteOutlined, EditOutlined, HomeOutlined, 
  TeamOutlined, ArrowLeftOutlined, SearchOutlined 
} from "@ant-design/icons";

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;

// --- 1. ГЛАВНАЯ СТРАНИЦА ---
const Home = () => (
  <div style={{ textAlign: "center", padding: "120px 20px" }}>
    <Title level={1} style={{ margin: 0, color: '#f3f4f6' }}>Домик</Title>
    <Text style={{ fontSize: "1.2rem", color: "#9ca3af" }}>
      Когда то здесь что то будет 🌙
    </Text>
  </div>
);

// --- 2. СПИСОК ПЕРСОНАЖЕЙ ---
const Characters = ({ characters, setCharacters }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChar, setEditingChar] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  const filtered = characters.filter(c => 
    c.name.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleOpenModal = (char = null) => {
    setEditingChar(char);
    if (char) {
      form.setFieldsValue({ ...char, color: char.color });
    } else {
      form.resetFields();
      form.setFieldsValue({ color: '#722ed1' });
    }
    setIsModalOpen(true);
  };

  const handleSave = (values) => {
    const hexColor = typeof values.color === 'string' ? values.color : values.color.toHexString();
    if (editingChar) {
      setCharacters(characters.map(c => c.id === editingChar.id ? { ...c, ...values, color: hexColor } : c));
      message.success("Данные обновлены");
    } else {
      setCharacters([...characters, { id: Date.now(), ...values, color: hexColor }]);
      message.success("Смулер добавлен");
    }
    setIsModalOpen(false);
  };

  const deleteChar = (id) => {
    setCharacters(characters.filter(c => c.id !== id));
    message.error("Смулер удален");
  };

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", alignItems: "center", marginBottom: 32, flexWrap: "wrap", gap: 20 }}>
        <Title level={2} style={{ margin: 0, color: '#f3f4f6' }}>Челики</Title>
        <Space size="middle">
          <Input 
            placeholder="Поиск..." 
            prefix={<SearchOutlined style={{ color: '#c084fc' }} />}
            value={searchText}
            onChange={e => setSearchText(e.target.value)}
            style={{ width: 220 }}
            allowClear
          />
          <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()} size="large">
            Добавить
          </Button>
        </Space>
      </div>

      <Row gutter={[24, 24]} style={{ margin: 0, width: "100%" }}>
        {filtered.map((char) => (
          <Col xs={24} sm={12} md={8} lg={6} xl={4} key={char.id}>
            <Card
              hoverable
              style={{ background: '#1d0d1b8c', border: '1px solid #ffffff', overflow: 'hidden' }}
              cover={
                <div style={{ 
                  height: 280, 
                  background: `radial-gradient(circle, ${char.color} 0%, #3c3c3c59 100%)`, 
                  display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 15 
                }}>
                  <img
                    alt={char.name}
                    src={char.image || "https://placeholder.com"}
                    style={{ maxWidth: '100%', maxHeight: '100%', objectFit: 'contain', filter: `drop-shadow(0 0 10px ${char.color}66)` }}
                  />
                </div>
              }
              actions={[
                <EditOutlined key="edit" onClick={() => handleOpenModal(char)} style={{ color: '#c084fc' }} />,
                <Link to={`/characters/${char.id}`} style={{ color: '#f3f4f6' }}>Детали</Link>,
                <Popconfirm title="Удалить?" onConfirm={() => deleteChar(char.id)}>
                  <DeleteOutlined style={{ color: "#ff7875" }} />
                </Popconfirm>,
              ]}
            >
              <Card.Meta 
                title={<Text strong style={{ color: '#f3f4f6' }}>{char.name}</Text>} 
                description={<Tag color={char.color} style={{ border: 'none' }}>{char.status}</Tag>} 
              />
            </Card>
          </Col>
        ))}
      </Row>

      <Modal title={editingChar ? "Изменить героя" : "Новый герой"} open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="name" label="Ник" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="age" label="Возраст"><Input /></Form.Item>
          <Form.Item name="status" label="Кликуха"><Input /></Form.Item>
          <Form.Item name="image" label="URL Фото"><Input /></Form.Item>
          <Form.Item name="color" label="Цвет фона картинки"><ColorPicker showText /></Form.Item>
          <Button type="primary" htmlType="submit" block size="large">Сохранить</Button>
        </Form>
      </Modal>

      {filtered.length === 0 && <Empty description="Никого не нашли" style={{ marginTop: 60 }} />}
    </div>
  );
};

// --- 3. ДЕТАЛИ ---
const CharacterDetail = ({ characters }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const char = characters.find(c => c.id === Number(id));

  if (!char) return <Empty style={{ padding: 100 }} />;

  return (
    <div style={{ padding: "40px", maxWidth: 1200, margin: "0 auto" }}>
      <Button icon={<ArrowLeftOutlined />} onClick={() => navigate(-1)} style={{ marginBottom: 24 }}>Назад</Button>
      <Card bordered={false} style={{ background: '#1f1135', border: `1px solid ${char.color}44` }}>
        <Row gutter={[40, 40]} align="middle">
          <Col xs={24} md={10}>
            <div style={{ 
              background: `radial-gradient(circle, ${char.color} 0%, #0a0a0a 100%)`, 
              padding: 30, borderRadius: 20, textAlign: 'center' 
            }}>
              <img src={char.image} alt={char.name} style={{ maxWidth: '100%', maxHeight: 500, objectFit: 'contain' }} />
            </div>
          </Col>
          <Col xs={24} md={14}>
            <Title level={1} style={{ color: '#f3f4f6' }}>{char.name}</Title>
            <Space direction="vertical" size="large">
              <Text style={{ fontSize: "1.3rem", color: '#d3adf7' }}>Возраст: <Text strong style={{ color: '#f3f4f6' }}>{char.age}</Text></Text>
              <Text style={{ fontSize: "1.3rem", color: '#d3adf7' }}>Кликуха: <Tag color={char.color} style={{ fontSize: '1rem' }}>{char.status}</Tag></Text>
            </Space>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

// --- 4. ОСНОВНОЙ APP ---
export default function App() {
  const [characters, setCharacters] = useState([]);

  useEffect(() => {
    const saved = localStorage.getItem("final_color_db");
    if (saved) setCharacters(JSON.parse(saved));
    else setCharacters([{ id: 1, name: "Темный Рыцарь", status: "Воин", color: "#722ed1", image: "https://unsplash.com" }]);
  }, []);

  useEffect(() => {
    localStorage.setItem("final_color_db", JSON.stringify(characters));
  }, [characters]);

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, token: { colorPrimary: '#722ed1', borderRadius: 12 } }}>
      <Router>
        <Layout style={{ minHeight: "100vh", background: "#161021", width: "100%" }}>
          <Header style={{ display: "flex", alignItems: "center", padding: "0 40px", background: "#1f1135", borderBottom: "1px solid #3c2463" }}>
            <div style={{ fontWeight: "900", color: "#d3adf7", marginRight: 40, fontSize: "1.5rem" }}>Smulers</div>
            <Menu mode="horizontal" theme="dark" style={{ flex: 1, border: "none", background: "transparent" }} items={[
              { key: "1", icon: <HomeOutlined />, label: <Link to="/">Домик</Link> },
              { key: "2", icon: <TeamOutlined />, label: <Link to="/characters">Челики</Link> }
            ]} />
          </Header>
          <Content style={{ flex: 1, background: "#0c0a11", width: "100%" }}>
            <Routes>
              <Route path="/" element={<Home />} />
              <Route path="/characters" element={<Characters characters={characters} setCharacters={setCharacters} />} />
              <Route path="/characters/:id" element={<CharacterDetail characters={characters} />} />
            </Routes>
          </Content>
          <Footer style={{ textAlign: "center", background: "#120b1f", color: "#594081", borderTop: "1px solid #2d1b4d" }}>Smule.govno</Footer>
        </Layout>
      </Router>
      <style>{`
        :root, html, body, #root { margin: 0 !important; padding: 0 !important; width: 100% !important; max-width: 100% !important; background: #161021 !important; height: 100%; }
        .ant-layout { background: #161021 !important; }
      `}</style>
    </ConfigProvider>
  );
}
