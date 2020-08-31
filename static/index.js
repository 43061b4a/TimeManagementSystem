//URLS:
const AUTH_URL = "/api/api-token-auth/"
const REGISTER_URL = "/api/register/"
const TIMESHEET_RESOURCE_URL = "/api/timesheets/"

const AUTH_REQUEST = "AUTH_REQUEST";
const AUTH_SUCCESS = "AUTH_SUCCESS";
const AUTH_ERROR = "AUTH_ERROR";
const AUTH_LOGOUT = "AUTH_LOGOUT";
const AUTH_REGISTER = "AUTH_REGISTER";
const AUTH_REGISTER_SUCCESS = "AUTH_REGISTER_SUCCESS";
const AUTH_REGISTER_ERROR = "AUTH_REGISTER_ERROR";

const TIMESHEET_LOG_WORK = "TIMESHEET_LOG_WORK"
const TIMESHEET_LOG_WORK_SUCCESS = "TIMESHEET_LOG_WORK_SUCCESS"
const TIMESHEET_LOG_WORK_ERROR = "TIMESHEET_LOG_WORK_ERROR"

const TIMESHEET_LOAD = "TIMESHEET_LOAD"
const TIMESHEET_LOAD_SUCCESS = "TIMESHEET_LOAD_SUCCESS"
const TIMESHEET_LOAD_ERROR = "TIMESHEET_LOAD_ERROR"

const TIMESHEET_DELETE_WORK = "TIMESHEET_DELETE_WORK"
const TIMESHEET_DELETE_WORK_SUCCESS = "TIMESHEET_DELETE_WORK_SUCCESS"
const TIMESHEET_DELETE_WORK_ERROR = "TIMESHEET_DELETE_WORK_ERROR"

const TIMESHEET_UPDATE_WORK = "TIMESHEET_UPDATE_WORK"
const TIMESHEET_UPDATE_WORK_SUCCESS = "TIMESHEET_UPDATE_WORK_SUCCESS"
const TIMESHEET_UPDATE_WORK_ERROR = "TIMESHEET_UPDATE_WORK_ERROR"


// store
const store = new Vuex.Store({
    state: {
        token: localStorage.getItem('user-token') || '',
        status: '',
        registered: '',
        appStatus: ''
    },
    getters: {
        isAuthenticated: state => !!state.token,
        authStatus: state => state.status,
        registerStatus: state => state.registered,
        authToken: state => state.token,
        appStatus: state => state.appStatus
    },
    actions: {
        [AUTH_REQUEST]: ({commit, dispatch}, user) => {
            return new Promise((resolve, reject) => {
                commit(AUTH_REQUEST);
                axios({url: AUTH_URL, data: user, method: "POST"})
                    .then(resp => {
                        localStorage.setItem("user-token", resp.data.token);
                        axios.defaults.headers.common['Authorization'] = "Token " + resp.data.token
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
        [TIMESHEET_LOG_WORK]: ({commit, dispatch, getters}, work_log) => {
            console.log(work_log);
            return new Promise((resolve, reject) => {
                commit(TIMESHEET_LOG_WORK);
                axios.defaults.headers.common['Authorization'] = `Token ${getters.authToken}`;
                axios.post(TIMESHEET_RESOURCE_URL, work_log)
                    .then(resp => {
                        commit(TIMESHEET_LOG_WORK_SUCCESS, resp);
                        resolve(resp);
                    })
                    .catch(err => {
                        commit(TIMESHEET_LOG_WORK_ERROR, err);
                        reject(err);
                    });
            });
        },

        [TIMESHEET_LOAD]: ({commit, dispatch, getters}, workday) => {
            console.log(workday);
            return new Promise((resolve, reject) => {
                commit(TIMESHEET_LOAD);
                axios.defaults.headers.common['Authorization'] = `Token ${getters.authToken}`;
                axios.get(TIMESHEET_RESOURCE_URL + `?workday=${workday.workday}`)
                    .then(resp => {
                        commit(TIMESHEET_LOAD_SUCCESS, resp);
                        resolve(resp);
                    })
                    .catch(err => {
                        commit(TIMESHEET_LOAD_ERROR, err);
                        reject(err);
                    });
            });
        },

        [TIMESHEET_DELETE_WORK]: ({commit, dispatch, getters}, id) => {
            console.log(id);
            return new Promise((resolve, reject) => {
                commit(TIMESHEET_LOAD);
                axios.defaults.headers.common['Authorization'] = `Token ${getters.authToken}`;
                axios.delete(TIMESHEET_RESOURCE_URL + `${id.id}/`)
                    .then(resp => {
                        commit(TIMESHEET_DELETE_WORK_SUCCESS, resp);
                        resolve(resp);
                    })
                    .catch(err => {
                        commit(TIMESHEET_DELETE_WORK_ERROR, err);
                        reject(err);
                    });
            });
        },

        [TIMESHEET_UPDATE_WORK]: ({commit, dispatch, getters}, work) => {
            console.log(work);
            return new Promise((resolve, reject) => {
                commit(TIMESHEET_UPDATE_WORK);
                axios.defaults.headers.common['Authorization'] = `Token ${getters.authToken}`;
                axios.put(TIMESHEET_RESOURCE_URL + `${work.id}/`, work)
                    .then(resp => {
                        commit(TIMESHEET_UPDATE_WORK_SUCCESS, resp);
                        resolve(resp);
                    })
                    .catch(err => {
                        commit(TIMESHEET_UPDATE_WORK_ERROR, err);
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
        },
        [AUTH_ERROR]: state => {
            state.status = "error";
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
        [TIMESHEET_LOG_WORK]: state => {
            state.appStatus = "logging_work";
        },
        [TIMESHEET_LOG_WORK_ERROR]: (state, err) => {
            state.appStatus = "work_log_error";
            state.error = err;
        },
        [TIMESHEET_LOG_WORK_SUCCESS]: (state, resp) => {
            state.appStatus = "work_logged";
            state.error = "";
        },
        [TIMESHEET_LOAD]: state => {
            state.appStatus = "loading_timesheet_data";
        },
        [TIMESHEET_LOAD_ERROR]: (state, err) => {
            state.appStatus = "loading_timesheet_data_error";
            state.error = err;
        },
        [TIMESHEET_LOAD_SUCCESS]: (state, resp) => {
            state.appStatus = "loading_timesheet_data_error_success";
            state.error = "";
        },
        [TIMESHEET_DELETE_WORK]: state => {
            state.appStatus = "deleting_work";
        },
        [TIMESHEET_DELETE_WORK_ERROR]: (state, err) => {
            state.appStatus = "work_delete_error";
            state.error = err;
        },
        [TIMESHEET_DELETE_WORK_SUCCESS]: (state, resp) => {
            state.appStatus = "work_deleted";
            state.error = "";
        },
        [TIMESHEET_UPDATE_WORK]: state => {
            state.appStatus = "updating_work";
        },
        [TIMESHEET_UPDATE_WORK_ERROR]: (state, err) => {
            state.appStatus = "work_update_error";
            state.error = err;
        },
        [TIMESHEET_UPDATE_WORK_SUCCESS]: (state, resp) => {
            state.appStatus = "work_updated";
            state.error = "";
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
                this.$router.push('/timesheet')
            }).catch(err => {
                console.log(err)
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

const Timesheet = Vue.component('timesheet', {
    data() {
        return {
            workday: new Date(new Date().setHours(0, 0, 0, 0)),
            description: "",
            duration: null,
            timesheet: [],
            attributes: [
                {
                    key: 'today',
                    highlight: true,
                }
            ]
        };
    },
    methods: {
        refresh_logged_work: function () {
            let {workday} = this
            workday = workday.toISOString().substring(0, 10);
            this.$store.dispatch(TIMESHEET_LOAD, {workday}).then((resp) => {
                this.timesheet = resp.data
            }).catch(err => {
                console.log(err)
            });
        },
        log_work: function () {
            let {workday, description, duration} = this
            workday = workday.toISOString().substring(0, 10);
            this.$store.dispatch(TIMESHEET_LOG_WORK, {workday, description, duration}).then(() => {
                this.refresh_logged_work()
                this.description = ""
                this.duration = null
            }).catch(err => {
                console.log(err)
            });
        },
        delete_work: function (work) {
            console.log(work)
            this.$store.dispatch(TIMESHEET_DELETE_WORK, {id: work.id}).then(() => {
                this.refresh_logged_work()
            }).catch(err => {
                console.log(err)
            });
        },
        update_work: function (work) {
            console.log(work)
            this.$store.dispatch(TIMESHEET_UPDATE_WORK, {
                id: work.id,
                workday: work.workday,
                description: work.description,
                duration: work.duration
            }).then(() => {
                this.refresh_logged_work()
            }).catch(err => {
                console.log(err)
            });
        }
    },
    template: '#timesheet-template',
    computed: {},
    beforeMount: function () {
        this.refresh_logged_work()
    }
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
    },
    {
        path: '/timesheet',
        name: 'timesheet',
        component: Timesheet
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
