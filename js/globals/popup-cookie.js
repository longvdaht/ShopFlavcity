class PopupCookie {
  constructor(name, value, daysToExpire = 7) {
    const today = new Date();
    const expiresDate = new Date();
    expiresDate.setTime(today.getTime() + 3600000 * 24 * daysToExpire);

    this.config = {
      expires: expiresDate.toGMTString(), // session cookie
      path: '/',
      domain: window.location.hostname,
      sameSite: 'none',
      secure: true,
    };
    this.name = name;
    this.value = value;
  }

  write() {
    const hasCookie = document.cookie.indexOf('; ') !== -1 && !document.cookie.split('; ').find((row) => row.startsWith(this.name));

    if (hasCookie || document.cookie.indexOf('; ') === -1) {
      document.cookie = `${this.name}=${this.value}; expires=${this.config.expires}; path=${this.config.path}; domain=${this.config.domain}; sameSite=${this.config.sameSite}; secure=${this.config.secure}`;
    }
  }

  read() {
    if (document.cookie.indexOf('; ') !== -1 && document.cookie.split('; ').find((row) => row.startsWith(this.name))) {
      const returnCookie = document.cookie
        .split('; ')
        .find((row) => row.startsWith(this.name))
        .split('=')[1];

      return returnCookie;
    } else {
      return false;
    }
  }

  destroy() {
    if (document.cookie.split('; ').find((row) => row.startsWith(this.name))) {
      document.cookie = `${this.name}=null; expires=${this.config.expires}; path=${this.config.path}; domain=${this.config.domain}`;
    }
  }
}

export {PopupCookie};
