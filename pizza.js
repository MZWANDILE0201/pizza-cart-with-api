document.addEventListener("alpine:init", () => {
    Alpine.data("pizzaCart", () => {
      return {
        title: "Pizza cart API",
        pizzas: [],
        username: "",
        cartId: "",
        cartPizzas: [],
        paymentAmount: 0.0,
        cartTotal: 0.0,
        message: "",
        login() {
          if (this.username.length > 2) {
              localStorage["username"] = this.username;
            this.createCart();
          } else {
            alert("username is too short");
          }
        },
        logout() {
          if (confirm("Do you want to logout")) {
            this.username = "";
            this.cartId = "";
            localStorage["cartId"] = "";
            localStorage["username"] = "";
          }
        },
        createCart() {
          if (!this.username) {
            this.cartId = "No Username to create a cart for";
            return;
          }
  
          // Prohibits cart codes to be created each time we refresh by taking cart Id from local storage
  
          const cartId = localStorage["cartId"];
          if (cartId) {
            this.cartId = cartId;
          }
  
          // else it creates a new cart id
          else {
            const createCartURL = `https://pizza-api.projectcodex.net/api/pizza-cart/create?username='${this.username}`;
            return axios.get(createCartURL).then((result) => {
              this.cartId = result.data.cart_code;
  
              localStorage["cartId"] = this.cartId;
            });
          }
        },
  
        getCart() {
          const getCarturl = `https://pizza-api.projectcodex.net/api/pizza-cart/${this.cartId}/get`;
          return axios.get(getCarturl);
        },
  
        addPizza(pizzaId) {
          return axios.post(
            "https://pizza-api.projectcodex.net/api/pizza-cart/add",
            {
              cart_code: this.cartId,
              pizza_id: pizzaId,
            }
          );
        },
  
        removePizza(pizzaId) {
          return axios.post(
            "https://pizza-api.projectcodex.net/api/pizza-cart/remove",
            {
              cart_code: this.cartId,
              pizza_id: pizzaId,
            }
          );
        },
        pay(amount) {
          return axios.post(
            "https://pizza-api.projectcodex.net/api/pizza-cart/pay",
            {
              cart_code: this.cartId,
              amount,
            }
          );
        },
        showCartData() {
          this.getCart().then((result) => {
            const cartData = result.data;
            this.cartPizzas = cartData.pizzas;
            this.cartTotal = cartData.total.toFixed(2);
          });
        },
        pizzaImage(pizza){
          return `/img/${pizza.size}.png`
        },
  
        init() {
  
  
          const storedUsername = localStorage['username'];
          if(storedUsername){
  
              
          }
          axios
            .get("https://pizza-api.projectcodex.net/api/pizzas")
            .then((result) => {
              //code here
              // console.log(result.data);
              this.pizzas = result.data.pizzas;
              //code here..
            });
  
          if (!this.cartId) {
            this.createCart().then(() => {
              this.showCartData();
            });
          }
        },

        postfeaturedPizzas(pizza) {

          let data = JSON.stringify({
            "username": this.username,
            "pizza_id": pizza
          });
  
          let config = {
            method: 'post',
            maxBodyLength: Infinity,
            url: 'https://pizza-api.projectcodex.net/api/pizzas/featured',
            headers: {
              'Content-Type': 'application/json'
            },
            data: data
          };
  
          axios.request(config)
            .then((result) => {
              console.log(JSON.stringify(result.data));
            }).then(() => {
              return this.featuredPizzas()
            })
            .catch((error) => {
              console.log(error);
            });
  
        },
  
        featuredPizzas() {
          return axios
            .get(`https://pizza-api.projectcodex.net/api/pizzas/featured?username=${this.username}`)
            .then((result) => {
  
              this.showFeaturedpizzas = result.data;
  
              console.log(result.data)
            })
        },
  
        //   Adds Pizza to card
  
        addPizzaToCart(pizzaId) {
          //   alert(pizzaid)
          this.addPizza(pizzaId).then(() => {
            this.showCartData();
          });
        },
  
        removePizzaFromCart(pizzaId) {
          //   alert(pizzaid)
          this.removePizza(pizzaId).then(() => {
            this.showCartData();
          });
        },
  
        payForCart() {
          // alert("Pay Now :" +this.paymentAmount);
  
          this.pay(this.paymentAmount).then((result) => {
            if (result.data.status == "failure") {
              this.message = result.data.message;
              setTimeout(() => (this.message = ""), 3000);
            } else {
              this.message = "Payment received";
              this.message = this.username +" , made a successful purchase for your order!";
              setTimeout(() => {
                this.message = "";
                this.cartPizzas = [];
                this.cartTotal = 0.0;
                this.cartId = "";
                this.paymentAmount = 0;
                localStorage["cartId"] = "";
                this.createCart();
              }, 3000);
            }
          });
        },
      };
    });
  });
  