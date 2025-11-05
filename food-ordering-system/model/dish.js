// 菜品数据管理
const dishManager = {
  currentRestaurant: null,
  cart: new Map(),

  // 初始化菜品列表
  init(restaurant) {
    this.currentRestaurant = restaurant;
    this.renderDishes();
    this.updateCart();
    this.bindEvents();
  },

  // 渲染菜品列表
  renderDishes() {
    const menuEl = document.getElementById('menu');
    if (!menuEl || !this.currentRestaurant) return;

    menuEl.innerHTML = '';
    this.currentRestaurant.dishes.forEach(dish => {
      const item = document.createElement('div');
      item.className = 'card';
      item.innerHTML = `
        <div class="menu-item">
          <div style="font-size:28px">${dish.emoji}</div>
          <div class="info">
            <div style="font-weight:700;overflow:hidden;text-overflow:ellipsis;white-space:nowrap">${dish.name}</div>
            <div class="muted" style="font-size:.9rem">${dish.desc}</div>
          </div>
          <div class="price">${this.formatMoney(dish.price)}</div>
          <button class="btn primary" data-add="${dish.id}">Add</button>
        </div>
      `;
      menuEl.appendChild(item);
    });
  },

  // 格式化金额
  formatMoney(value) {
    return '$' + (Math.round(value * 100) / 100).toFixed(2);
  },

  // 添加到购物车
  addToCart(dish) {
    const entry = this.cart.get(dish.id) || { dish, qty: 0 };
    entry.qty++;
    this.cart.set(dish.id, entry);
    this.updateCart();
  },

  // 更新购物车UI
  updateCart() {
    const cartList = document.getElementById('cartList');
    const subtotalEl = document.getElementById('subtotal');
    if (!cartList || !subtotalEl) return;

    cartList.innerHTML = '';
    let total = 0;

    if (this.cart.size === 0) {
      cartList.innerHTML = '<li>Cart is empty</li>';
    } else {
      this.cart.forEach(({ dish, qty }) => {
        const lineTotal = dish.price * qty;
        total += lineTotal;
        const li = document.createElement('li');
        li.innerHTML = `
          <span style="display:flex;gap:8px;align-items:center">
            <span style="font-size:20px">${dish.emoji}</span>${dish.name}
          </span>
          <span class="qty">
            <button data-act="dec" data-id="${dish.id}">-</button>
            <span>${qty}</span>
            <button data-act="inc" data-id="${dish.id}">+</button>
            <button data-act="del" data-id="${dish.id}">✕</button>
          </span>
        `;
        cartList.appendChild(li);
      });
    }

    subtotalEl.textContent = this.formatMoney(total);
  },

  // 绑定事件
  bindEvents() {
    const menuEl = document.getElementById('menu');
    const cartList = document.getElementById('cartList');
    const checkoutBtn = document.getElementById('checkoutBtn');

    // 菜品添加事件
    menuEl?.addEventListener('click', (e) => {
      const dishId = e.target.dataset.add;
      if (!dishId || !this.currentRestaurant) return;
      
      const dish = this.currentRestaurant.dishes.find(d => d.id === dishId);
      if (dish) this.addToCart(dish);
    });

    // 购物车操作事件
    cartList?.addEventListener('click', (e) => {
      const dishId = e.target.dataset.id;
      const action = e.target.dataset.act;
      if (!dishId || !action) return;

      const entry = this.cart.get(dishId);
      if (!entry) return;

      switch (action) {
        case 'inc':
          entry.qty++;
          break;
        case 'dec':
          entry.qty = Math.max(0, entry.qty - 1);
          if (entry.qty === 0) this.cart.delete(dishId);
          break;
        case 'del':
          this.cart.delete(dishId);
          break;
      }
      this.updateCart();
    });

    // 结账按钮事件
    checkoutBtn?.addEventListener('click', () => {
      if (this.cart.size === 0) {
        alert('Your cart is empty.');
        return;
      }
      location.hash = 'payment';
    });
  }
};

// 初始化时暴露给全局
window.dishManager = dishManager;