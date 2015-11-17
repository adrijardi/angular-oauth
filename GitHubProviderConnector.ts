class GitHubProviderConnector extends AbstractOauthProvider implements OauthProviderConnector {

    private loginURL = 'https://github.com/login/oauth/authorize';

    private logoutURL = '';

    private appId;

    private randomState;

    private tokenExchangeFunction;

    getSetupErrors(): string[] {
        if (!this.appId) {
            return ['Github Client Id not set.'];
        }
    }

    getLoginUrl(redirectURL: string): string {
        var randomState = AbstractOauthProvider.randomString(16);
        var scope = '';

        return this.loginURL + '?client_id=' + this.appId + '&redirect_uri=' + redirectURL +
        '&state=' + this.randomState + '&scope=' + scope, '_blank', 'location=no,clearcache=yes'
    }

    getLogoutUrl(token): string {
        return this.logoutURL + '?access_token=' + token + '&next=' + this.logoutRedirectURL, '_blank', 'location=no,clearcache=yes'
    }

    /**
     * Called either by oauthcallback.html (when the app is running the browser) or by the loginWindow loadstart event
     * handler defined in the login() function (when the app is running in the Cordova/PhoneGap container).
     * @param url - The oautchRedictURL called by Facebook with the access_token in the querystring at the ned of the
     * OAuth workflow.
     */
    oauthCallback(url) {
    // Parse the OAuth data received from Facebook
    var queryString,
        obj;

    this.loginProcessed = true;
    if (url.indexOf("code=") > 0) {
        queryString = url.substr(url.indexOf('?') + 1);
        obj = AbstractOauthProvider.parseQueryString(queryString);
        if(this.randomState === obj.state) {
            function callback(response) {
                this.tokenStore.accessToken = response.access_token;
                if (this.loginCallback) this.loginCallback({status: 'connected', authResponse: response});
            }
            this.tokenExchangeFunction(obj.code, this.oauthRedirectURL, this.randomState, callback);
        }
        else {
            if (this.loginCallback) this.loginCallback({status: 'not_authorized'});
        }
    } else if (url.indexOf("error=") > 0) {
        queryString = url.substring(url.indexOf('?') + 1, url.indexOf('#'));
        obj = AbstractOauthProvider.parseQueryString(queryString);
        if (this.loginCallback) this.loginCallback({status: 'not_authorized', error: obj.error});
    } else {
        if (this.loginCallback) this.loginCallback({status: 'not_authorized'});
    }
}
}