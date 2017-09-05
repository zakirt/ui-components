const uiComponents = (() => {
    // Subscriber will help us implement mediator pattern 
    // to notify all UI components.
    const uiSubscriber = {
        components: {},
        broadcast: function (componentId, data) {
            let keys = Object.keys(this.components);
            let len = keys.length;

            while (len--) {
                let component = this.components[keys[len]];

                // Don't fire listener for the broadcasting component
                if (componentId !== component.componentId) {
                    component.listen(data);
                }
            }
        },
        subscribe: function (component) {
            if (!this.components[component.componentId]) {
                this.components[component.componentId] = component;
            }
        },
        unsubscribe: function (component) {
            if (this.components[component.componentId]) {
                this.components[component.componentId] = undefined;
            }
        }
    };

    /**
     * All UI components inherit from this object.
     */
    const uiComponent = {
        componentId: null,
        elem: null,
        componentNotifier: null,
        init: function (elem) {
            this.initComponent(elem);
        },
        initComponent: function (elem) {
            this.elem = elem;
            this.componentId = Math.floor(Math.random() * (9999 - 1000 + 1)) + 1000;
            this.componentNotifier = uiSubscriber;
            this.componentNotifier.subscribe(this);
        },
        listen: function (data) {
            console.log('Notification fired: ', data);
        }
    };

    /**
     * Component for creating login forms.
     */
    const loginComponent = {
        init: function (elem) {
            this.initComponent(elem);
            this.formElem = this.elem.querySelector('form');
            this.welcomeElem = this.elem.querySelector('#welcome');
            this.formElem.addEventListener('submit', e => {
                e.preventDefault();
                this.login();
            });
        },
        login: function () {
            let username = this.elem.querySelector('#username').value;

            if (username) {
                this.componentNotifier.broadcast(this.componentId, {
                    username: 'Zakir',
                    loggedIn: true
                });

                this.welcomeElem.classList.remove('d-none');
                this.welcomeElem.textContent = 'Welcome ' + username;
                this.formElem.classList.add('d-none');
            }
        },
        logout: function () {
            this.welcomeElem.classList.add('d-none');
            this.welcomeElem.textContent = '';
            this.formElem.classList.remove('d-none');
        },
        listen: function (data) {
            if (data.loggingOut) {
                this.logout();
            }
        }
    }

    /**
     * Component for creating navigation menus.
     */
    const navComponent = {
        init: function (elem) {
            this.initComponent(elem);
            this.loginLinkElem = this.elem.querySelector('#logout-link');
            this.loginLinkElem.addEventListener('click', e => {
                e.preventDefault();
                this.componentNotifier.broadcast(this.componentId, {
                    loggingOut: true
                });
                this.hideLogoutLink();
            });
        },
        showLogoutLink() {
            this.loginLinkElem.classList.remove('d-none');
        },
        hideLogoutLink() {
            this.loginLinkElem.classList.add('d-none');
        },
        listen: function (data) {
            if (data.loggedIn) {
                this.showLogoutLink();
            }
        }
    };

    /**
     * Component for creating (Jumbotron) banners.
     */
    const bannerComponent = {
        init: function(elem) {
            this.initComponent(elem);
            this.headline = this.elem.querySelector('h1');
        },
        listen: function(data) {
            this.headline.textContent = data.username ? 'Hello ' + data.username : 'Hello world!';         
        }
    };

    /**
     * @method createUIComponent
     * @memberof uiComponents
     * @description Factory method for creating new UI components.
     * @param {string} compName
     * @returns {Object} 
     */
    function createUIComponent(compName) {
        let component = Object.create(uiComponent);
        let elem;

        switch (compName) {
            case 'nav':
                component = Object.assign(component, navComponent);
                elem = document.querySelector('#main-nav');
                break;
            case 'login':
                component = Object.assign(component, loginComponent);
                elem = document.querySelector('#login-box');
                break;
            case 'banner':
                component = Object.assign(component, bannerComponent);
                elem = document.querySelector('#banner');
                break;    
        }

        component.init(elem);
        return component;
    }

    return {
        createUIComponent: createUIComponent
    };
})();

let mainNav = uiComponents.createUIComponent('nav');
let loginBox = uiComponents.createUIComponent('login');
let bannerComponent = uiComponents.createUIComponent('banner');