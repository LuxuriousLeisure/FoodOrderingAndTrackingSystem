const User = require('../model/user');

// 显示登录页
exports.getLogin = (req, res) => {
  res.render('login', { 
    role: req.query.as || 'user',
    error: null 
  });
};

// 处理登录
exports.postLogin = async (req, res) => {
  try {
    const { email, password, role } = req.body;
    const user = await User.findByEmail(email);
    
    if (!user || user.password !== password || user.role !== role) {
      return res.render('login', { 
        role, 
        error: 'Invalid credentials' 
      });
    }

    req.session.user = {
      id: user._id,
      name: user.name,
      email: user.email,
      role: user.role
    };
    res.redirect(req.session.redirectTo || '/');
  } catch (err) {
    res.status(500).send('Login error');
  }
};

// 处理注册
exports.postRegister = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    const existingUser = await User.findByEmail(email);
    
    if (existingUser) {
      return res.render('login', { 
        role, 
        error: 'Email already registered' 
      });
    }

    const userId = await User.create({ name, email, password, role });
    req.session.user = { id: userId, name, email, role };
    res.redirect('/');
  } catch (err) {
    res.status(500).send('Registration error');
  }
};

// 登出
exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};