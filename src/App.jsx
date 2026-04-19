import React, { useState, useEffect } from "react";
import { HashRouter as Router, Routes, Route, Link, useParams, useNavigate } from "react-router-dom";
import { 
  Layout, Menu, Button, Input, Card, Row, Col, Typography, 
  Modal, Form, Popconfirm, Empty, Space, Tag, ConfigProvider, theme, message, ColorPicker 
} from "antd";
import { 
  PlusOutlined, DeleteOutlined, EditOutlined, SearchOutlined, LockOutlined,
  SendOutlined, CustomerServiceOutlined, ThunderboltOutlined 
} from "@ant-design/icons";
import { createClient } from '@supabase/supabase-js';

// --- НАСТРОЙКИ SUPABASE ---
const SUPABASE_URL = 'https://szwgwrylqqsccrhdjubm.supabase.co';
const SUPABASE_ANON_KEY = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6InN6d2d3cnlscXFzY2NyaGRqdWJtIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzY1OTUxNTEsImV4cCI6MjA5MjE3MTE1MX0.o2YKzuSyPnTaNGs8ru29lEHC_06bRf6e3_ucZ6H-iE4';
const supabase = createClient(SUPABASE_URL, SUPABASE_ANON_KEY);

const { Header, Content, Footer } = Layout;
const { Title, Text } = Typography;
const ADMIN_PASSWORD = "deusbl17"; 

// --- 1. ГЛАВНАЯ СТРАНИЦА ---
const Home = ({ isAdmin, login }) => (
  <div style={{ 
    minHeight: "calc(100vh - 160px)", 
    display: "flex", 
    flexDirection: "column", 
    justifyContent: "center", 
    alignItems: "center",
    background: "radial-gradient(circle at center, #1a0d2b 0%, #0a0a0a 100%)",
    margin: 0,
    padding: "0 20px"
  }}>
    <Title level={1} style={{ margin: 0, color: '#f3f4f6', fontSize: 'clamp(2.5rem, 8vw, 4rem)', textShadow: '0 0 20px #722ed166' }}>Домик</Title>
    <Text style={{ fontSize: "1.3rem", color: "#9ca3af", marginBottom: 40, textAlign: 'center' }}>
      Приветствую вас на доске позора🌙
    </Text>
    {!isAdmin ? (
      <Button 
        size="large"
        icon={<LockOutlined />} 
        onClick={login} 
        style={{ borderColor: '#722ed1', color: '#b37feb', height: '50px', padding: '0 30px', borderRadius: '12px' }}
        className="purple-hover-btn"
      >
        Вход для админа
      </Button>
    ) : (
      <Tag color="#722ed1" style={{ padding: '8px 20px', fontSize: '1rem', borderRadius: '20px' }}>
        Вы вошли как создатель 👑
      </Tag>
    )}
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
    if (char) {
      form.setFieldsValue({ ...char, color: char.color || '#722ed1' });
    } else {
      form.resetFields();
      form.setFieldsValue({ color: '#722ed1' });
    }
    setIsModalOpen(true);
  };

  const handleSave = async (values) => {
    const hexColor = typeof values.color === 'string' ? values.color : values.color.toHexString();
    const charData = { nickname: values.nickname, klikuha: values.klikuha, age: values.age, image: values.image, color: hexColor };
    
    try {
      if (editingChar?.id) {
        const { error } = await supabase.from('characters').update(charData).eq('id', editingChar.id);
        if (error) throw error;
        message.success("Обновлено в облаке");
      } else {
        const { error } = await supabase.from('characters').insert([charData]);
        if (error) throw error;
        message.success("Добавлено в базу");
      }
      fetchCharacters();
      setIsModalOpen(false);
    } catch (err) {
      message.error("Ошибка: " + err.message);
    }
  };

  const deleteChar = async (id) => {
    const { error } = await supabase.from('characters').delete().eq('id', id);
    if (!error) {
      message.error("Удалено");
      fetchCharacters();
    }
  };

  return (
    <div style={{ padding: "40px 20px" }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 40, flexWrap: "wrap", gap: 20 }}>
        <Title level={2} style={{ color: '#f3f4f6', margin: 0 }}>Смулеры</Title>
        <div style={{ display: 'flex', gap: '10px' }}>
          <Input 
            placeholder="Поиск..." 
            prefix={<SearchOutlined style={{ color: '#722ed1' }}/>} 
            onChange={e => setSearchText(e.target.value)}
            style={{ borderRadius: '10px', width: 220 }}
          />
          {isAdmin && <Button type="primary" icon={<PlusOutlined />} onClick={() => handleOpenModal()} style={{ borderRadius: '10px' }}>Добавить</Button>}
        </div>
      </div>

      <Row gutter={[24, 24]}>
        {filtered.map((char) => (
          <Col xs={24} sm={12} md={8} lg={6} xl={4} key={char.id}>
            <Card
              hoverable
              className="char-card"
              style={{ 
                background: '#07010c', 
                border: `1px solid #333`, 
                borderRadius: 15, 
                overflow: 'hidden',
                '--hover-color': char.color || '#722ed1' 
              }}
              cover={
                <div style={{ 
                  height: 250, 
                  background: `radial-gradient(circle, ${char.color}44 0%, #0a0a0a 100%)`, 
                  display: 'flex', 
                  alignItems: 'center', 
                  justifyContent: 'center',
                  padding: '15px'
                }}>
                  <img src={char.image} style={{ maxWidth: '90%', maxHeight: '90%', objectFit: 'contain' }} alt="char" />
                </div>
              }
              actions={isAdmin ? [
                <EditOutlined key="edit" onClick={() => handleOpenModal(char)} />,
                <Link key="det" to={`/characters/${char.id}`}>Детали</Link>,
                <Popconfirm key="del" title="Удалить?" onConfirm={() => deleteChar(char.id)}>
                  <DeleteOutlined style={{ color: "#ff4d4f" }} />
                </Popconfirm>
              ] : [<Link key="prof" to={`/characters/${char.id}`}>Профиль</Link>]}
            >
              <Card.Meta title={<Text style={{ color: '#fff' }}>{char.nickname}</Text>} description={<Tag color={char.color}>{char.klikuha}</Tag>} />
            </Card>
          </Col>
        ))}
      </Row>

      <Modal 
        title={editingChar ? "Правка" : "Новый"} 
        open={isModalOpen} 
        onCancel={() => setIsModalOpen(false)} 
        footer={null} 
        destroyOnClose
      >
        <Form form={form} layout="vertical" onFinish={handleSave}>
          <Form.Item name="nickname" label="Ник" rules={[{ required: true }]}><Input /></Form.Item>
          <Form.Item name="klikuha" label="Кликуха"><Input /></Form.Item>
          <Form.Item name="age" label="Возраст"><Input /></Form.Item>
          <Form.Item name="image" label="URL Фото"><Input /></Form.Item>
          <Form.Item name="color" label="Цвет"><ColorPicker showText /></Form.Item>
          <Button type="primary" htmlType="submit" block size="large">Сохранить</Button>
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
    <div style={{ padding: "40px 20px", maxWidth: 1200, margin: "0 auto" }}>
      <Button onClick={() => navigate(-1)} style={{ marginBottom: 20, borderRadius: '8px' }}>Назад</Button>
      <Card style={{ background: '#140a1f', borderColor: char.color, borderRadius: 20 }}>
        <Row gutter={[32, 32]} align="middle">
          <Col md={10} xs={24}><img src={char.image} style={{ width: '100%', borderRadius: 20 }} alt="pic" /></Col>
          <Col md={14} xs={24}>
            <Title level={1} style={{ color: '#fff' }}>{char.nickname}</Title>
            <Tag color={char.color} style={{ fontSize: 16, marginBottom: 20 }}>{char.klikuha}</Tag>
            <div><Text style={{ color: '#fff', fontSize: 18 }}>Возраст: {char.age}</Text></div>
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
    const { data, error } = await supabase.from('characters').select('*');
    if (!error) setCharacters(data || []);
  };

  useEffect(() => {
    fetchCharacters();
    setIsAdmin(localStorage.getItem("is_admin") === "true");
  }, []);

  const login = () => {
    const pass = prompt("Пароль:");
    if (pass === ADMIN_PASSWORD) {
      setIsAdmin(true);
      localStorage.setItem("is_admin", "true");
      message.success("Доступ разрешен");
    }
  };

  return (
    <ConfigProvider theme={{ algorithm: theme.darkAlgorithm, token: { colorPrimary: '#722ed1', borderRadius: 8 } }}>
      <style>{`
        .ant-menu-item { border-radius: 12px !important; margin: 8px 4px !important; transition: all 0.3s ease !important; height: 40px !important; line-height: 40px !important; }
        .ant-menu-horizontal > .ant-menu-item::after { display: none !important; }
        .ant-menu-dark.ant-menu-horizontal > .ant-menu-item-selected { background: #722ed1 !important; color: #fff !important; }
        .ant-menu-dark.ant-menu-horizontal > .ant-menu-item:hover { background: #722ed144 !important; }
        .purple-hover-icon:hover { color: #b37feb !important; filter: drop-shadow(0 0 10px #722ed1); transform: scale(1.1); }
        .purple-hover-btn:hover { border-color: #9254de !important; color: #9254de !important; box-shadow: 0 0 15px #722ed144; }
        .char-card { transition: all 0.3s ease !important; }
        .char-card:hover { border-color: var(--hover-color) !important; transform: translateY(-5px); box-shadow: 0 10px 30px var(--hover-color) 44; }
        .ant-layout-header { padding: 0 !important; display: flex; justify-content: center; background: #0a0a0a !important; border-bottom: 1px solid #722ed133; }
        body { margin: 0; padding: 0; background: #0a0a0a; }
      `}</style>
      <Router>
        <Layout style={{ minHeight: "100vh", background: "#0a0a0a" }}>
          <Header>
            <Menu theme="dark" mode="horizontal" style={{ background: 'transparent', border: 'none', width: 'auto' }}
              items={[{ key: 'h', label: <Link to="/">Домик</Link> }, { key: 'c', label: <Link to="/characters">Смулеры</Link> }]} 
            />
          </Header>
          <Content style={{ padding: 0 }}><Routes>
              <Route path="/" element={<Home isAdmin={isAdmin} login={login} />} />
              <Route path="/characters" element={<Characters characters={characters} isAdmin={isAdmin} fetchCharacters={fetchCharacters} />} />
              <Route path="/characters/:id" element={<CharacterDetail characters={characters} />} />
          </Routes></Content>
          <Footer style={{ textAlign: 'center', background: '#0a0a0a', borderTop: '1px solid #1f1135', padding: '40px 20px' }}>
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '15px' }}>
              <Space size="large" style={{ fontSize: '28px' }}>
                <a key="f1" href="https://t.me/Deusbibl" target="_blank" rel="noreferrer"><SendOutlined className="purple-hover-icon" style={{ color: '#722ed1' }} /></a>
                <a key="f2" href="https://smule.com" target="_blank" rel="noreferrer"><CustomerServiceOutlined className="purple-hover-icon" style={{ color: '#722ed1' }} /></a>
                <ThunderboltOutlined className="purple-hover-icon" style={{ color: '#722ed1' }} />
              </Space>
              <Text style={{ color: '#444' }}>©2024 Сделано для Доски Позора 🌙</Text>
            </div>
          </Footer>
        </Layout>
      </Router>
    </ConfigProvider>
  );
}
