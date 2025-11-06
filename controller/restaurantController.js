const Restaurant = require('../model/restaurant');

// 显示所有餐厅
exports.getAllRestaurants = async (req, res) => {
  try {
    const restaurants = await Restaurant.findAll();
    res.render('home', {
      user: req.session.user,
      restaurants
    });
  } catch (err) {
    res.status(500).send('Error loading restaurants');
  }
};

// 显示餐厅详情
// exports.getRestaurantById = async (req, res) => {
//   try {
//     const restaurant = await Restaurant.findById(req.params.id);
//     if (!restaurant) return res.redirect('/');

//     const dishes = await Restaurant.getDishes(req.params.id);
//     const comments = await Restaurant.getComments(req.params.id);

//     res.render('restaurant', {
//       user: req.session.user,
//       restaurant,
//       dishes,
//       comments,
//       cart: req.session.cart || []
//     });
//   } catch (err) {
//     res.status(500).send('Error loading restaurant');
//   }
// };
// 修改后代码
  exports.getRestaurantById = async (req, res) => {
    try {
      const restaurant = await Restaurant.findById(req.params.id);
      if (!restaurant) return res.redirect('/');

      // 关键：将ObjectId类型的餐厅ID转成字符串
      const restaurantIdStr = req.params.id.toString(); 
      const dishes = await Restaurant.getDishes(restaurantIdStr); // 传入字符串ID
      const comments = await Restaurant.getComments(restaurantIdStr); // 评论查询也同步修改（可选）

      res.render('restaurant', {
        user: req.session.user,
        restaurant,
        dishes, // 此时能查询到匹配的菜品
        comments,
        cart: req.session.cart || []
      });
    } catch (err) {
      res.status(500).send('Error loading restaurant');
    }
  };

// 添加评论
exports.addComment = async (req, res) => {
  if (!req.session.user) return res.redirect(`/login?as=user`);

  try {
    await Restaurant.addComment(req.params.id, {
      userId: req.session.user.id,
      userName: req.session.user.name,
      text: req.body.commentText
    });
    res.redirect(`/restaurant/${req.params.id}`);
  } catch (err) {
    res.status(500).send('Error adding comment');
  }
};