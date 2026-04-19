import React, { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import { 
  Layout, Menu, Button, Input, Card, Row, Col, Typography, 
  Modal, Form, Popconfirm, Empty, Space, Tag, message, ColorPicker 
} from "antd";
import { 
  PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined, LockOutlined 
} from "@ant-design/icons";
import { createClient } from '@supabase/supabase-js';

// --- НАСТРОЙКИ SUPABASE ---
const SUPABASE_URL = 'https://supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6d2d3cnlscXFzY2NyaGRqdWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1OTUxNTEsImV4cCI6MjA5MjE3MTE1MX0.o2YKzuSyPnTaNGs8ru29lEHC_06bRf6e3_ucZ6H-iE4';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const { Header, Content } = Layout;
const { Title, Text } = Typography;
const ADMIN_PASSWORD = "deusbl17"; 

// --- 1. ГЛАВНАЯ СТРАНИЦА ---
const Home = ({ isAdmin, login }) => (
  <div style={{ textAlign: "center", padding: "120px 20px" }}>
    <Title level={1} style={{ margin: 0, color: '#f3f4f6' }}>Домик</Title>
    <Text style={{ fontSize: "1.2rem", color: "#9ca3af" }}>Приветствую вас на доске позора🌙</Text>
    <div style={{ marginTop: 40 }}>
      {!isAdmin ? (
        <Button icon={<LockOutlined />} onClick={login} ghost>Вход для админа</Button>
      ) : (
        <Tag color="gold">Вы вошли как создатель 👑</Tag>
      )}
    </div>
  </div>
);

// --- 2. СПИСОК ПЕРСОНАЖЕЙ ---
const Characters = ({ characters, isAdmin, fetchCharacters }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingChar, setEditingChar] = useState(null);
  const [searchText, setSearchText] = useState("");
  const [form] = Form.useForm();

  const filtered = characters.filter(c => 
    c.nickname?.toLowerCase().includes(searchText.toLowerCase())
  );

  const handleOpenModal = (char = null) => {
    setEditingChar(char);
    if (char) form.setFieldsValue(char);
    else {
      form.resetFields();
      form.setFieldsValue({ color: '#722ed1' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (values) => {
    const hexColor = typeof values.color === 'string' ? values.color : values.color.toHexString();
    const charData = { ...values, color: hexColor };

    if (editingChar) {
      const { error } = await supabase.from('characters').update(charData).eq('id', editingChar.id);
      if (!error) message.success("Обновлено в облаке");
    } else {
      const { error } = await supabase.from('characters').insert([charData]);
      if (!error) message.success("Добавлено в базу");
    }
    
    fetchCharacters();
    setIsModalOpen(false);
  };

  const deleteChar = async (id) => {
    const { error } = await supabase.from('characters').delete().eq('id', id);
    if (!error) {
      message.error("Удалено везде");
      fetchCharacters();
    }
  };

  return (
    <div style={{ padding: "40px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 32, flexWrap: "wrap", gap: 20 }}>
        <Title level={2} style={{ color: '#f3f4f6' }}>Персонажи</Title>
        <Space>
          <Input 
            placeholder="Поиск..." 
            prefix={<SearchOutlined />} 
            onChange={e => setSearchText(e.target.value)} 
          />
          {isAdmin && <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()}>Добавить</Button>}
        </Space>
      </div>

      <Row gutter={[24, 24]}>
        {filtered.map((char) => (
          <Col xs={24} sm={12} md={8} lg={6} key={char.id}>
            <Card
              hoverable
              style={{ background: '#1f1135', border: `1px solid ${char.color}88` }}
              cover={
                <div style={{ height: 250, background: `radial-gradient(circle, ${char.color}44 0%, #161021 100%)`, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <img src={char.image} style={{ maxWidth: '80%', maxHeight: '80%' }} alt="char" />
                </div>
              }
              actions={isAdmin ? [
                <EditOutlined onClick={() => handleOpenModal(char)} />,
                <Link to={`/characters/${char.id}`}>Детали</Link>,
                <Popconfirm title="Удалить?" onConfirm={() => deleteChar(char.id)}><DeleteOutlined style={{ color: "red" }} /></Popconfirm>
              ] : [<Link to={`/characters/${char.id}`}>Профиль</Link>]}
            >
              <Card.Meta title={<Text style={{ color: '#fff' }}>{char.nickname}</Text>} description={<Tag color={char.color}>{char.klikuha}</Tag>} />
            </Card>
          </Col>
        ))}
      </Row>

      <Modal title="Данные персонажа" open={isModalOpen} onCancel={() => setIsModalOpen(false)} footer={null}>
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="nickname" label="Ник" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="klikuha" label="Кликуха"><Input /></Form.Item>
          <Form.Item name="age" label="Возраст"><Input /></Form.Item>
          <Form.Item name="image" label="URL Фото"><Input /></Form.Item>
          <Form.Item name="color" label="Цвет"><ColorPicker showText /></Form.Item>
          <Button type="primary" htmlType="submit" block>Сохранить</Button>
        </Form>
      </Modal>
    </div>
  );
};

// --- 3. ДЕТАЛИ ---
const CharacterDetail = ({ characters }) => {
  const { id } = useParams();
  const navigate = useNavigate();
  const char = characters.find(c => String(c.id) === String(id));
  if (!char) return <Empty style={{ padding: 100 }} />;

  return (
    <div style={{ padding: "40px", maxWidth: 1000, margin: "0 auto" }}>
      <Button onClick={() => navigate(-1)} style={{ marginBottom: 20 }}>Назад</Button>
      <Card style={{ background: '#1f1135', borderColor: char.color }}>
        <Row gutter={40} align="middle">
          <Col md={10} xs={24}>
            <img src={char.image} style={{ width: '100%', borderRadius: 20 }} alt="pic" />
          </Col>
          <Col md={14} xs={24}>
            <Title level={1} style={{ color: '#fff' }}>{char.nickname}</Title>
            <Title level={4} style={{ color: '#aaa' }}>{char.klikuha}</Title>
            <Text style={{ color: '#fff', fontSize: 18 }}>Возраст: {char.age}</Text>
          </Col>
        </Row>
      </Card>
    </div>
  );
};

// --- 4. ОСНОВНОЙ APP ---
export default function App() {
  const [characters, setCharacters] = useState([]);
  const [isAdmin, setIsAdmin] = useState(false);

  const fetchCharacters = async () => {
    const { data, error } = await supabase.from('characters').select('*').order('created_at', { ascending: false });
    if (!error) setCharacters(data);
  };

  useEffect(() => {
    fetchCharacters();
    setIsAdmin(localStorage.getItem("is_admin") === "true");
  }, []);

  const login = () => {
    const pass = prompt("Введите пароль:");
    if (pass === ADMIN_PASSWORD) {
      setIsAdmin(true);
      localStorage.setItem("is_admin", "true");
      message.success("Добро пожаловать, босс");
    } else {
      message.error("Неверно");
    }
  };

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm }}>
      <Router>
        <Layout style={{ minHeight: "100vh", background: "#0a0a0a" }}>
          <Header style={{ display: "flex", justifyContent: "center", background: "#111" }}>
            <Menu theme="dark" mode="horizontal" items={[
              { key: '1', label: <Link to="/">Главная</Link> },
              { key: '2', label: <Link to="/characters">Персонажи</Link> }
            ]} />
          </Header>
          <Content>
            <Routes>
              <Route path="/" element={<Home isAdmin={isAdmin} login={login} />} />
              <Route path="/characters" element={<Characters characters={characters} isAdmin={isAdmin} fetchCharacters={fetchCharacters} />} />
              <Route path="/characters/:id" element={<CharacterDetail characters={characters} />} />
            </Routes>
          </Content>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}
