// const User = require('../model/user');

// // 显示登录页
// exports.getLogin = (req, res) => {
//   res.render('login', { 
//     role: req.query.as || 'user',
//     error: null 
//   });
// };

// // 处理登录
// exports.postLogin = async (req, res) => {
//   try {
//     const { email, password, role } = req.body;
//     const user = await User.findByEmail(email);
    
//     if (!user || user.password !== password || user.role !== role) {
//       return res.render('login', { 
//         role, 
//         error: 'Invalid credentials' 
//       });
//     }

//     req.session.user = {
//       id: user._id,
//       name: user.name,
//       email: user.email,
//       role: user.role
//     };
//     res.redirect(req.session.redirectTo || '/');
//   } catch (err) {
//     res.status(500).send('Login error');
//   }
// };

// // 处理注册
// exports.postRegister = async (req, res) => {
//   try {
//     const { name, email, password, role } = req.body;
//     const existingUser = await User.findByEmail(email);
    
//     if (existingUser) {
//       return res.render('login', { 
//         role, 
//         error: 'Email already registered' 
//       });
//     }

//     const userId = await User.create({ name, email, password, role });
//     req.session.user = { id: userId, name, email, role };
//     res.redirect('/');
//   } catch (err) {
//     res.status(500).send('Registration error');
//   }
// };

// // 登出
// exports.logout = (req, res) => {
//   req.session.destroy();
//   res.redirect('/');
// };

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

exports.getLocation = async (req, res) => {
  try {
    const { email, lat, lon } = req.body;  // Access from body (JSON)
    
    if (!email || !lat || !lon) {
      return res.status(400).json({ success: false, message: 'Missing data' });
    }

    const updated = await User.updateLocation(email, lat, lon);
    console.log('Update result:', updated ? 'Modified' : 'No change/user not found', { email, lat, lon });
    if (updated) {
      res.json({ success: true, message: 'Location updated' });
    } else {
      res.status(404).json({ success: false, message: 'User not found or no update' });
    }
  } catch (err) {
    console.error(err);
    res.status(500).json({ success: false, message: 'Server error' });
  }
};
exports.set

// 登出
exports.logout = (req, res) => {
  req.session.destroy();
  res.redirect('/');
};