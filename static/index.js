//URLS:
const AUTH_URL = "/api/api-token-auth/"
const REGISTER_URL = "/api/api-token-auth/"

const AUTH_REQUEST = "AUTH_REQUEST";
const AUTH_SUCCESS = "AUTH_SUCCESS";
const AUTH_ERROR = "AUTH_ERROR";
const AUTH_LOGOUT = "AUTH_LOGOUT";

// store
const store = new Vuex.Store({
    state: {
        token: localStorage.getItem('user-token') || '',
        status: '',
    },
    getters: {
        isAuthenticated: state => !!state.token,
        authStatus: state => state.status,
    },
    actions: {
        [AUTH_REQUEST]: ({commit, dispatch}, user) => {
            return new Promise((resolve, reject) => {
                commit(AUTH_REQUEST);
                axios({url: AUTH_URL, data: user, method: "POST"})
                    .then(resp => {
                        localStorage.setItem("user-token", resp.token);
                        axios.defaults.headers.common['Authorization'] = "Token" + resp.data.token
                        commit(AUTH_SUCCESS, resp);
                        resolve(resp);
                    })
                    .catch(err => {
                        commit(AUTH_ERROR, err);
                        localStorage.removeItem("user-token");
                        reject(err);
                    });
            });
        },
        [AUTH_LOGOUT]: ({commit}) => {
            return new Promise(resolve => {
                commit(AUTH_LOGOUT);
                localStorage.removeItem("user-token");
                console.log(localStorage.getItem('user-token'))
                resolve();
            });
        }
    },
    mutations: {
        [AUTH_REQUEST]: state => {
            state.status = "loading";
        },
        [AUTH_SUCCESS]: (state, resp) => {
            state.status = "success";
            state.token = resp.data.token;
            state.hasLoadedOnce = true;
        },
        [AUTH_ERROR]: state => {
            state.status = "error";
            state.hasLoadedOnce = true;
        },
        [AUTH_LOGOUT]: state => {
            state.token = "";
        }
    }
})

// components
const Login = Vue.component('login', {
    data() {
        return {
            username: "",
            password: ""
        };
    },
    template: '#login-template',
    methods: {
        login: function () {
            const {username, password} = this
            console.log(username, password);
            this.$store.dispatch('AUTH_REQUEST', {username, password}).then(() => {
                this.$router.push('/')
            })
        }
    }
});
const Logout = Vue.component('logout', {
    data() {
        return {};
    },
    template: '#logout-template',
    methods: {
        logout: function () {
            this.$store.dispatch(AUTH_LOGOUT);
        }
    },
    beforeMount() {
        this.logout()
    }
});
const Register = Vue.component('register', {
    data: function () {
        return {}
    },
    template: '#register-template',
});


// router
const routes = [
    {
        path: '/login',
        name: 'login',
        component: Login
    },
    {
        path: '/register',
        name: 'register',
        component: Register
    },
    {
        path: '/logout',
        name: 'logout',
        component: Logout
    },
]

const router = new VueRouter({
    mode: 'history',
    routes: routes,
})


// app
const mainApp = new Vue({
    router,
    store,
    computed: {
        isAuthenticated() {
            return this.$store.getters.isAuthenticated
        }
    },
}).$mount('#app');
