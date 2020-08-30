//URLS:
const AUTH_URL = "/api/api-token-auth/"
const REGISTER_URL = "/api/register/"

const AUTH_REQUEST = "AUTH_REQUEST";
const AUTH_SUCCESS = "AUTH_SUCCESS";
const AUTH_ERROR = "AUTH_ERROR";
const AUTH_LOGOUT = "AUTH_LOGOUT";
const AUTH_REGISTER = "AUTH_REGISTER";
const AUTH_REGISTER_SUCCESS = "AUTH_REGISTER_SUCCESS";
const AUTH_REGISTER_ERROR = "AUTH_REGISTER_ERROR";

// store
const store = new Vuex.Store({
    state: {
        token: localStorage.getItem('user-token') || '',
        status: '',
        registered: '',
    },
    getters: {
        isAuthenticated: state => !!state.token,
        authStatus: state => state.status,
        registerStatus: state => state.registered,
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
                resolve();
            });
        },
        [AUTH_REGISTER]: ({commit, dispatch}, user) => {
            user["profile"] = {"preferred_working_hours": parseInt(user["preferred_working_hours"])}
            delete user["preferred_working_hours"]
            console.log(user);
            return new Promise((resolve, reject) => {
                commit(AUTH_REGISTER);
                axios.post(REGISTER_URL, user)
                    .then(resp => {
                        commit(AUTH_REGISTER_SUCCESS, resp);
                        resolve(resp);
                    })
                    .catch(err => {
                        commit(AUTH_REGISTER_ERROR, err);
                        reject(err);
                    });
            });
        },
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
        },
        [AUTH_REGISTER]: state => {
            state.registered = "registering";
        },
        [AUTH_REGISTER_ERROR]: (state, err) => {
            state.registered = "error";
            state.registration_errors = err;
        },
        [AUTH_REGISTER_SUCCESS]: (state, resp) => {
            state.registered = "registered";
            state.registration_errors = "";
        },
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
    computed: {
        isAuthError() {
            return this.$store.getters.authStatus === 'error'
        }
    },
    methods: {
        login: function () {
            const {username, password} = this
            this.$store.dispatch(AUTH_REQUEST, {username, password}).then(() => {
                this.$router.push('/')
            }).catch(err => {
                console.log(err.response.data)
            });
        }
    }
});

const Register = Vue.component('register', {
    data() {
        return {
            username: "",
            password: "",
            email: "",
            preferred_working_hours: "",
        };
    },
    template: '#register-template',
    methods: {
        register: function () {
            const {email, username, password, preferred_working_hours} = this
            this.$store.dispatch(AUTH_REGISTER, {email, username, password, preferred_working_hours}).then(() => {
                this.$router.push('/register_status')
            }).catch(err => {
                console.log(err.response.data)
            });
        }
    },
    computed: {
        registerError() {
            return this.$store.getters.registerStatus === 'error'
        }
    },
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
const RegisterStatus = Vue.component('register-status', {
    data() {
        return {};
    },
    template: '#register-status-template',
    computed: {
        isRegistered() {
            return this.$store.getters.registerStatus === 'registered'
        }
    },
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
    {
        path: '/register_status',
        name: 'register_status',
        component: RegisterStatus
    }
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
