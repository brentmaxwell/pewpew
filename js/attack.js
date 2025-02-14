// setup default min/max timer range for random draw
attack_min = 100;
attack_max = 2000;

// add/change the attack types here
attack_type = ["any port scan in a storm", "ssh brutish force", "Thought Leader Tweet",
  "SYN FLOOD BA-BY", "Spotty", "Heartbleed Hotel", "Po_ODLE", "Sharknado",
  "CORGI Attack", "Ping of DOOM", "Conficker", "Goldfinger", "SANDPAPER",
  "SNAILshock", "Spaghetti RAT", "Driduplex"];

// gotta add types here if you add more sounds (or delete them)

audio_type = ["starwars", "tng", "b5", "wargames", "pew", "galaga", "asteroids", "china", "timallen"]

// need this to more easily grab URI query parameters
$.extend({
  getUrlVars: function () {
    var vars = [], hash;
    var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
    for (var i = 0; i < hashes.length; i++) {
      hash = hashes[i].split('=');
      vars.push(hash[0]);
      vars[hash[0]] = hash[1];
    }
    return vars;
  },
  getUrlVar: function (name) {
    return $.getUrlVars()[name];
  }
});

// here is where we deal with parameters
// try to grab them, see if they exist, make changes to defaults if they do

var norse_mode = $.getUrlVar('norse_mode');
var bad_day = $.getUrlVar('bad_day');
var org_name = $.getUrlVar('org_name');
var chatt_mode = $.getUrlVar('chatt_mode');
var china_mode = $.getUrlVar('china_mode');
var dprk_mode = $.getUrlVar('dprk_mode');
var employee_mode = $.getUrlVar('employee_mode');
var employee_fname = $.getUrlVar('employee_fname');
var employee_lname = $.getUrlVar('employee_lname');
var origin = $.getUrlVar('origin');
var random_mode = $.getUrlVar('random_mode');
var tng = $.getUrlVar('tng');
var wargames = $.getUrlVar('wargames');
var b5 = $.getUrlVar('b5');
var nofx = $.getUrlVar('nofx');
var pew = $.getUrlVar('pew');
var allfx = $.getUrlVar('allfx')
var galaga = $.getUrlVar('galaga')
var asteroids = $.getUrlVar('asteroids')
var china = $.getUrlVar('china')
var timallen = $.getUrlVar('timallen')
var drill_mode = $.getUrlVar("drill_mode")
var in_lat = $.getUrlVar("lat")
var in_lon = $.getUrlVar("lon")
var destination = $.getUrlVar("destination")
var greenattacks = $.getUrlVar("greenattacks")
var redattacks = $.getUrlVar("redattacks")

snd_id = "starwars";
if (typeof tng !== 'undefined') { snd_id = "tng"; }
if (typeof b5 !== 'undefined') { snd_id = "b5"; }
if (typeof wargames !== 'undefined') { snd_id = "wargames"; }
if (typeof pew !== 'undefined') { snd_id = "pew"; }
if (typeof galaga !== 'undefined') { snd_id = "galaga"; }
if (typeof asteroids !== 'undefined') { snd_id = "asteroids"; }
if (typeof china !== 'undefined') { snd_id = "china"; }
if (typeof timallen !== 'undefined') { snd_id = "timallen"; }

if (typeof bad_day !== 'undefined') {
  attack_min = 200;
  attack_max = 200;
}

if (typeof org_name !== 'undefined') { $("#titlediv").text(decodeURI(org_name) + " IPew Attack Map").html() }

// we maintain a fixed queue of "attacks" via this class
function FixedQueue(size, initialValues) {
  initialValues = (initialValues || []);
  var queue = Array.apply(null, initialValues);
  queue.fixedSize = size;
  queue.push = FixedQueue.push;
  queue.splice = FixedQueue.splice;
  queue.unshift = FixedQueue.unshift;
  FixedQueue.trimTail.call(queue);
  return (queue);
}

FixedQueue.trimHead = function () {
  if (this.length <= this.fixedSize) { return; }
  Array.prototype.splice.call(this, 0, (this.length - this.fixedSize));
};

FixedQueue.trimTail = function () {
  if (this.length <= this.fixedSize) { return; }
  Array.prototype.splice.call(this, this.fixedSize, (this.length - this.fixedSize)
  );
};

FixedQueue.wrapMethod = function (methodName, trimMethod) {
  var wrapper = function () {
    var method = Array.prototype[methodName];
    var result = method.apply(this, arguments);
    trimMethod.call(this);
    return (result);
  };
  return (wrapper);
};

FixedQueue.push = FixedQueue.wrapMethod("push", FixedQueue.trimHead);
FixedQueue.splice = FixedQueue.wrapMethod("splice", FixedQueue.trimTail);
FixedQueue.unshift = FixedQueue.wrapMethod("unshift", FixedQueue.trimTail);

var rand = function (min, max) {
  return Math.random() * (max - min) + min;
};

var getRandomCountry = function (countries, weight) {

  var total_weight = weight.reduce(function (prev, cur, i, arr) {
    return prev + cur;
  });

  var random_num = rand(0, total_weight);
  var weight_sum = 0;

  for (var i = 0; i < countries.length; i++) {
    weight_sum += weight[i];
    weight_sum = +weight_sum.toFixed(2);

    if (random_num <= weight_sum) {
      return countries[i];
    }
  }

};

// need to make this dynamic since it is approximated from sources

var countries = [9, 22, 29, 49, 56, 58, 78, 82, 102, 117, 139, 176, 186];
var weight = [0.000, 0.001, 0.004, 0.008, 0.009, 0.037, 0.181, 0.002, 0.000, 0.415, 0.006, 0.075, 0.088];

// the fun begins!
//
// pretty simple setup ->
// * make base Datamap
// * setup timers to add random events to a queue
// * update the Datamap

var map = new Datamap({

  scope: 'world',
  element: document.getElementById('container1'),
  projection: 'winkel3',
  // change the projection to something else only if you have absolutely no cartographic sense

  fills: { defaultFill: 'black', },

  geographyConfig: {
    dataUrl: null,
    hideAntarctica: true,
    borderWidth: 0.75,
    borderColor: '#4393c3',
    popupTemplate: function (geography, data) {
      return '<div class="hoverinfo" style="color:white;background:black">' +
        geography.properties.name + '</div>';
    },
    popupOnHover: true,
    highlightOnHover: false,
    highlightFillColor: 'black',
    highlightBorderColor: 'rgba(250, 15, 160, 0.2)',
    highlightBorderWidth: 2
  },

})

// we read in a modified file of all country centers
var centers = [];
d3.tsv("country_centroids_primary.csv", function (data) { centers = data; });
d3.csv("samplatlong.csv", function (data) { slatlong = data; });
d3.csv("cnlatlong.csv", function (data) { cnlatlong = data; });

// setup structures for the "hits" (arcs)
// and circle booms

var hits = FixedQueue(7, []);
var boom = FixedQueue(7, []);

// we need random numbers and also a way to build random ip addresses
function getRandomInt(min, max) { return Math.floor(Math.random() * (max - min + 1)) + min; }
function getOctet() { return Math.round(Math.random() * 255); }
function randomIP() { return (getOctet() + '.' + getOctet() + '.' + getOctet() + '.' + getOctet()); }
function getStroke() { return Math.round(Math.random() * 100); }
function getDestination() { return Math.round(Math.random() * 100); }

// doing this a bit fancy for a hack, but it makes it
// easier to group code functions together and have variables
// out of global scope
var attacks = {

  interval: getRandomInt(attack_min, attack_max),

  init: function () {
    setTimeout(
      jQuery.proxy(this.getData, this),
      this.interval
    );
  },

  getData: function () {

    var self = this;

    if (typeof norse_mode !== 'undefined') { return; }

    if (typeof random_mode !== 'undefined') { Math.floor((Math.random() * slatlong.length)); }

    dst = Math.floor((Math.random() * slatlong.length));
    src = Math.floor((Math.random() * slatlong.length));

    if ((dst == src)) {
      dst = src + 1;
      if (dst > slatlong.length - 1) { dst = src - 1 }
    }

    if (typeof allfx !== 'undefined') {
      snd_id = audio_type[Math.floor((Math.random() * audio_type.length))];
    }
    // no guarantee of sound playing w/o the load - stupid browsers
    if (typeof nofx === 'undefined') {
      document.getElementById(snd_id).load();
      document.getElementById(snd_id).play();
    }

    // add hit to the arc queue
    // use strokeColor to set arc line color

    var srclat = slatlong[src].lat;
    var srclong = slatlong[src].long;
    var dstlat = slatlong[dst].lat;
    var dstlong = slatlong[dst].long;
    which_attack = attack_type[Math.floor((Math.random() * attack_type.length))];
    var srccountry = slatlong[src]["country"];
    // "Hi, Mandiant!!"
    if (typeof china_mode !== 'undefined') {
      srclat = cnlatlong[src].lat;
      srclong = cnlatlong[src].long;
      if (cnlatlong[src].country == "chn") { which_attack = "ZOMGOSH CHINA!!!!!!"; }
      srccountry = cnlatlong[src]["country"];
    }
    // "Hi, Kim Jong!"
    else if (typeof dprk_mode !== 'undefined') {
      srclat = 39.0194;
      srclong = 125.7381;
      which_attack = "ZOMG NORTH KOREAZ!!!";
      srccountry = "kp";
    }
    // source is always Chattanooga if chatt_mode is set
    // "Hi ThreatStream!!" http://www.csoonline.com/article/2689609/network-security/threat-intelligence-firm-mistakes-research-for-nation-state-attack.html
    else if (typeof chatt_mode !== 'undefined') {
      srclat = 35.0456297;
      srclong = -85.30968;
      which_attack = "OMG NATION STATE CHATTANOOGA!!!";
      srccountry = "usa";
    }
    // blame a former employee
    else if (typeof employee_mode !== 'undefined') {
      if (typeof in_lat !== 'undefined' && typeof in_lon !== 'undefined') {
        srclat = in_lat;
        srclong = in_lon;
      }
      which_attack = "Former employee attack"
      if (typeof employee_fname !== 'undefined' && typeof employee_lname !== 'undefined') {
        which_attack += ":" + employee_fname + " " + employee_lname;
      }
      srccountry = "usa";
    }

    // Specify a country
    else if (typeof origin !== 'undefined') {
      srccountry = origin.toUpperCase();
      var center_id = 0;
      for (i = 0; i < centers.length; i++) {
        center_id = i;
        if (centers[i].FIPS10 === srccountry) {
          break;
        }
      }

      srccountry = origin.toLowerCase();
      srclat = centers[center_id].LAT;
      srclong = centers[center_id].LONG;
    }

    // Specify a destination country
    if (typeof destination !== 'undefined' && getDestination() < 80) {
      dstcountry = destination.toUpperCase();
      var center_id = 0;
      for (i = 0; i < centers.length; i++) {
        center_id = i;
        if (centers[i].FIPS10 === dstcountry) {
          break;
        }
      }

      dstcountry = destination.toLowerCase();
      attackdiv_slatlong = dstcountry;
      dstlat = centers[center_id].LAT;
      dstlong = centers[center_id].LONG;
    }
    else {
      attackdiv_slatlong = slatlong[dst]["country"];
    }

    // Specify attack color
    if (typeof greenattacks !== 'undefined') {
      strokeColor = 'green';
    }
    else if (typeof redattacks !== 'undefined') {
      strokeColor = 'red';
    }
    else {
      if (getStroke() < 70) {
        strokeColor = 'green';
      }
      else {
        strokeColor = 'red';
      }
    }

    if (typeof drill_mode != 'undefined') {

      dstlat = in_lat
      dstlong = in_lon
    }

    hits.push({
      origin: { latitude: +srclat, longitude: +srclong },
      destination: { latitude: +dstlat, longitude: +dstlong }
    });
    map.arc(hits, { strokeWidth: 2, strokeColor: strokeColor });

    // add boom to the bubbles queue

    boom.push({
      radius: 7, latitude: +dstlat, longitude: +dstlong,
      fillOpacity: 0.5, attk: which_attack
    });
    map.bubbles(boom, {
      popupTemplate: function (geo, data) {
        return '<div class="hoverinfo">' + data.attk + '</div>';
      }
    });

    // update the scrolling attack div
    $('#attackdiv').append(srccountry + " (" + randomIP() + ") " +
      " <span style='color:red'>attacks</span> " +
      attackdiv_slatlong + " (" + randomIP() + ") " +
      " <span style='color:steelblue'>(" + which_attack + ")</span> " +
      "<br/>");
    $('#attackdiv').animate({ scrollTop: $('#attackdiv').prop("scrollHeight") }, 500);

    // pick a new random time and start the timer again!
    this.interval = getRandomInt(attack_min, attack_max);
    this.init();
  },

};

// start the ball rolling!
attacks.init();

// lazy-dude's responsive window
d3.select(window).on('resize', function () { location.reload(); });
