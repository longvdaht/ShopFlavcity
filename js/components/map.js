import {mapStyle} from '../util/map-styles';
import loadScript from '../util/loader';

window.theme.mapAPI = window.theme.mapAPI || null;

if (!customElements.get('map-component')) {
  customElements.define(
    'map-component',
    class MapComponent extends HTMLElement {
      constructor() {
        super();

        this.key = this.getAttribute('data-api-key');
        this.styleString = this.getAttribute('data-style') || '';
        this.zoomString = this.getAttribute('data-zoom') || 14;
        this.address = this.getAttribute('data-address');
        this.enableCorrection = this.getAttribute('data-latlong-correction');
        this.lat = this.getAttribute('data-lat');
        this.long = this.getAttribute('data-long');
      }

      connectedCallback() {
        if (this.key) {
          this.initMaps();
        }
      }

      initMaps() {
        const apiLoaded = loadAPI(this.key);
        apiLoaded
          .then(() => {
            return this.enableCorrection === 'true' && this.lat !== '' && this.long !== '' ? new google.maps.LatLng(this.lat, this.long) : geocodeAddressPromise(this.address);
          })
          .then((center) => {
            const zoom = parseInt(this.zoomString, 10);
            const styles = mapStyle(this.styleString);
            const mapOptions = {
              zoom,
              styles,
              center,
              draggable: true,
              clickableIcons: false,
              scrollwheel: false,
              zoomControl: false,
              disableDefaultUI: true,
            };
            const map = createMap(this, mapOptions);

            return map;
          })
          .then((map) => {
            this.map = map;
          })
          .catch((e) => {
            console.log('Failed to load Google Map');
            console.log(e);
          });
      }

      disconnectedCallback() {
        if (typeof window.google !== 'undefined') {
          google.maps.event.clearListeners(this.map, 'resize');
        }
      }
    }
  );
}

function loadAPI(key) {
  if (window.theme.mapAPI === null) {
    const urlKey = `https://maps.googleapis.com/maps/api/js?key=${key}`;
    window.theme.mapAPI = loadScript({url: urlKey});
  }
  return window.theme.mapAPI;
}

function createMap(container, options) {
  var map = new google.maps.Map(container, options);
  var center = map.getCenter();

  // eslint-disable-next-line no-unused-vars
  var marker = new google.maps.Marker({
    map: map,
    position: center,
  });

  google.maps.event.addDomListener(window, 'resize', function () {
    google.maps.event.trigger(map, 'resize');
    map.setCenter(center);
  });
  return map;
}

function geocodeAddressPromise(address) {
  return new Promise((resolve, reject) => {
    var geocoder = new google.maps.Geocoder();
    geocoder.geocode({address: address}, function (results, status) {
      if (status == 'OK') {
        var latLong = {
          lat: results[0].geometry.location.lat(),
          lng: results[0].geometry.location.lng(),
        };
        resolve(latLong);
      } else {
        reject(status);
      }
    });
  });
}
