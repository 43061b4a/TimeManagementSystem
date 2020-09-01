//URLS:
const AUTH_URL = "/api/api-token-auth/"
const REGISTER_URL = "/api/register/"
const TIMESHEET_RESOURCE_URL = "/api/timesheets/"
const USERS_RESOURCE_URL = "/api/users/"

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

const REPORT_LOAD = "REPORT_LOAD"
const REPORT_LOAD_SUCCESS = "REPORT_LOAD_SUCCESS"
const REPORT_LOAD_ERROR = "REPORT_LOAD_ERROR"

const PROFILE_UPDATE = "PROFILE_UPDATE"
const PROFILE_UPDATE_SUCCESS = "PROFILE_UPDATE_SUCCESS"
const PROFILE_UPDATE_ERROR = "PROFILE_UPDATE_ERROR"

// store
const store = new Vuex.Store({
    state: {
        token: localStorage.getItem('user-token') || '',
        preferred_working_hours: localStorage.getItem("preferred_working_hours") || '',
        email: localStorage.getItem("email") || '',
        username: localStorage.getItem("username") || '',
        userid: localStorage.getItem("userid") || '',
        status: '',
        registered: '',
        appStatus: '',
    },
    getters: {
        isAuthenticated: state => !!state.token,
        authStatus: state => state.status,
        registerStatus: state => state.registered,
        appStatus: state => state.appStatus,
        authToken: state => state.token,
        preferredWorkingHours: state => state.preferred_working_hours,
        email: state => state.email,
        username: state => state.username,
        userid: state => state.userid,
    },
    actions: {
        [AUTH_REQUEST]: ({commit, dispatch}, user) => {
            return new Promise((resolve, reject) => {
                commit(AUTH_REQUEST);
                axios({url: AUTH_URL, data: user, method: "POST"})
                    .then(resp => {
                        console.log(resp)
                        localStorage.setItem("user-token", resp.data.token);
                        localStorage.setItem("preferred_working_hours", resp.data.preferred_working_hours);
                        localStorage.setItem("email", resp.data.email);
                        localStorage.setItem("username", resp.data.username);
                        localStorage.setItem("userid", resp.data.user_id);

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
                localStorage.removeItem("user-token")
                localStorage.removeItem("preferred_working_hours")
                localStorage.removeItem("email");
                localStorage.removeItem("username");
                localStorage.removeItem("userid");
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

        [REPORT_LOAD]: ({commit, dispatch, getters}, dates) => {
            const {start, end} = dates
            console.log(dates)
            console.log(start, end)
            return new Promise((resolve, reject) => {
                commit(REPORT_LOAD);
                axios.defaults.headers.common['Authorization'] = `Token ${getters.authToken}`;
                axios.get(TIMESHEET_RESOURCE_URL + `?startdate=${start}&enddate=${end}&sort=workday`)
                    .then(resp => {
                        commit(REPORT_LOAD_SUCCESS, resp);
                        resolve(resp);
                    })
                    .catch(err => {
                        commit(REPORT_LOAD_ERROR, err);
                        reject(err);
                    });
            });
        },

        [PROFILE_UPDATE]: ({commit, dispatch, getters}, user) => {
            console.log(user);
            if (user.password === "") {
                delete user['password']
            }

            return new Promise((resolve, reject) => {
                commit(PROFILE_UPDATE);
                axios.defaults.headers.common['Authorization'] = `Token ${getters.authToken}`;
                axios.put(USERS_RESOURCE_URL + `${getters.userid}/`, user)
                    .then(resp => {
                        commit(PROFILE_UPDATE_SUCCESS, resp);
                        localStorage.setItem("preferred_working_hours", resp.data.profile.preferred_working_hours);
                        localStorage.setItem("email", resp.data.email);
                        localStorage.setItem("username", resp.data.username);
                        resolve(resp);
                    })
                    .catch(err => {
                        commit(PROFILE_UPDATE_ERROR, err);
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
            state.preferred_working_hours = resp.data.preferred_working_hours;
            state.email = resp.data.email;
            state.username = resp.data.username;
            state.userid = resp.data.user_id;
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
            state.appStatus = "loading_timesheet_data_success";
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
        [REPORT_LOAD]: state => {
            state.appStatus = "loading_report_data";
        },
        [REPORT_LOAD_ERROR]: (state, err) => {
            state.appStatus = "loading_report_data_error";
            state.error = err;
        },
        [REPORT_LOAD_SUCCESS]: (state, resp) => {
            state.appStatus = "loading_report_data_success";
            state.error = "";
        },
        [PROFILE_UPDATE]: state => {
            state.appStatus = "updating_profile";
        },
        [PROFILE_UPDATE_ERROR]: (state, err) => {
            state.appStatus = "profile_update_error";
            state.error = err;
        },
        [PROFILE_UPDATE_SUCCESS]: (state, resp) => {
            state.appStatus = "profile_updated";
            state.error = "";
            state.preferred_working_hours = resp.data.profile.preferred_working_hours;
            state.email = resp.data.email;
            state.username = resp.data.username;
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
                this.$router.push('/report')
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
            preferredWorkingHours: this.$store.getters.preferredWorkingHours,
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
    computed: {
        highlight_hours: function () {
            let prefHours = this.$store.getters.preferredWorkingHours
            let totalHours = 0
            for (let i = 0; i < this.timesheet.length; i++) {
                totalHours += this.timesheet[i].duration
            }
            return totalHours < prefHours
        }
    },
    beforeMount: function () {
        this.refresh_logged_work()
    }
});

Date.prototype.addDays = function (days) {
    var date = new Date(this.valueOf());
    date.setDate(date.getDate() + days);
    return date;
}
const Report = Vue.component('report', {
    data() {
        return {
            startdate: new Date(new Date().addDays(-6).setHours(0, 0, 0, 0)),
            enddate: new Date(new Date().addDays(2).setHours(0, 0, 0, 0)),
            timesheet: []
        };
    },
    methods: {
        refresh_report: function () {
            let {startdate, enddate} = this
            let start = startdate.toISOString().substring(0, 10);
            let end = enddate.toISOString().substring(0, 10);
            console.log(start, end)
            this.$store.dispatch(REPORT_LOAD, {start, end}).then((resp) => {

                grouped_data = {}
                for (let i = 0; i < resp.data.length; i++) {
                    if (!grouped_data[resp.data[i].workday]) {
                        grouped_data[resp.data[i].workday] = {
                            workday: resp.data[i].workday,
                            totalHours: resp.data[i].duration,
                            descriptionCombined: [resp.data[i].description]
                        }
                    } else {
                        const {workday, totalHours, descriptionCombined} = grouped_data[resp.data[i].workday];
                        descriptionCombined.push(resp.data[i].description)
                        grouped_data[resp.data[i].workday] = {
                            workday,
                            totalHours: resp.data[i].duration + totalHours,
                            descriptionCombined: descriptionCombined
                        }
                    }
                    const {totalHours, descriptionCombined} = grouped_data[resp.data[i].workday];
                    console.log(totalHours, descriptionCombined)
                }
                this.timesheet = grouped_data
                console.log(start, end, grouped_data)
            }).catch(err => {
                console.log(err)
            });
        }
    },
    template: '#report-template',
    computed: {},
    beforeMount: function () {
        this.refresh_report()
    }
});

const Profile = Vue.component('profile', {
    data() {
        return {
            username: this.$store.getters.username,
            password: "",
            email: this.$store.getters.email,
            preferred_working_hours: this.$store.getters.preferredWorkingHours,
        };
    },
    template: '#profile-template',
    methods: {
        update_profile: function () {
            let {username, password, email, preferred_working_hours} = this
            console.log({username, password, email, preferred_working_hours})
            this.$store.dispatch(PROFILE_UPDATE, {
                username: username.trim(),
                email: email.trim(),
                password: password.trim(),
                profile: {preferred_working_hours: parseInt(preferred_working_hours)}
            }).then(() => {

            }).catch(err => {
                console.log(err)
            });
        }
    },
    computed: {
        hasUpdateError() {
            return this.$store.getters.appStatus === 'profile_update_error'
        },
        updateSucceeded() {
            return this.$store.getters.appStatus === 'profile_updated'
        }
    },
});


const NotFoundComponent = Vue.component('NotFoundComponent', {
    data() {
        return {};
    },
    template: '#NotFoundComponent-template',
    methods: {},
    computed: {},
});


// router
const routes = [
    {
        path: '/login',
        name: 'login',
        component: Login
    },
    {
        path: '/',
        redirect: 'report',
        component: Report
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
        component: Timesheet,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/report',
        name: 'report',
        component: Report,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '/profile',
        name: 'profile',
        component: Profile,
        meta: {
            requiresAuth: true
        }
    },
    {
        path: '*',
        component: NotFoundComponent
    }
]

const router = new VueRouter({
    mode: 'history',
    routes: routes,
})

router.beforeEach((to, from, next) => {
    if (to.matched.some(record => record.meta.requiresAuth)) {
        // this route requires auth, check if logged in
        // if not, redirect to login page.
        if (!store.getters.isAuthenticated) {
            next({name: 'Login'})
        } else {
            next() // go to wherever I'm going
        }
    } else {
        next() // does not require auth, make sure to always call next()!
    }
})

// app
const mainApp = new Vue({
    router,
    store,
    computed: {
        isAuthenticated() {
            return this.$store.getters.isAuthenticated
        },
    },
}).$mount('#app');
