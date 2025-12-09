const User = require('../model/user');
const Driver = require('../model/driver');
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
    if(role=="user"){
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
    }
    if(role=="staff"){
    	    const staff = await Driver.findByEmail(email);
	    
	    if (!staff || staff.password !== password || staff.role !== role) {
	      return res.render('login', { 
		role, 
		error: 'Invalid credentials' 
	      });
	    }

	    req.session.staff = {
	      id: staff._id,
	      name: staff.name,
	      email: staff.email,
	      role: staff.role
	    };
	    res.redirect(req.session.redirectTo || '/staff');
    
    }
    
    
  } catch (err) {
    res.render('error', { error: err })
  }
};

// 处理注册
exports.postRegister = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;
    	console.log("your role is "+role);
    	if(role=="user"){
    	    console.log("user registed")
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
    	}
    	if(role=="staff"){
    	       console.log("staff")
    		 const existingStaff = await Driver.findByEmail(email);
	    	 console.log("email search");
	    if (existingStaff) {
	      return res.render('login', { 
		role, 
		error: 'Email already registered' 
	      });
	    }

	    const staffId = await Driver.create({ name, email, password, role });
	    req.session.staff = { id: staffId, name, email, role };
	    res.redirect('/staff');
    	}
    
    
  } catch (err) {
    res.render('error', { error: err })
  }
};

exports.set

// 登出
exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};
