function inArray(needle, haystack) {
	var length = haystack.length;
	for(var i = 0; i < length; i++) {
		if(haystack[i] == needle) return true;
	}
	return false;
}
function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}

var json_data_file = 'data/data.json';
var months_es = ['Enero', 'Febrero', 'Marzo', 'Abril', 'Mayo', 'Junio', 'Julio', 'Agosto', 'Septiembre', 'Octubre', 'Noviembre', 'Diciembre'];
var weekdays_es = ['Lunes', 'Martes', 'Miércoles', 'Jueves', 'Viernes', 'Sábado', 'Domingo'];

var vd = {
	items : null,
	regions : null,
	months : null,
	selected_region : '',
	selected_distance : '',
	selected_date : '',
	distances : [
		{'value' : "0, 10", 	'text' : "Hasta 10 Km."},
		{'value' : "10, 22", 	'text' : "De 10km a Media Maraton"},
		{'value' : "21, 43", 	'text' : "De Media Maraton a Maratón"},
		{'value' : "42", 		'text' : "Superior a Maratón"}
	],
	current_item : {},
	filtered_items : null,
	loading : true,
	filtering : false
}

var vm = new Vue({
	// ---------------------------
	el: '#app',
	// ---------------------------
	data: vd,
	// ---------------------------
	created: function () {
		this.getJSON();
	},
  	// ---------------------------
	filters: {
		es_month : function(v) {
			return months_es[v-1].toUpperCase().substr(0, 3);
		},
		distanceValue : function(v) {
			var val = '';
			for (var i=0; i<this.distances.length; i++) {
				if ( v == this.distances[i]['value'] ) {
					val = this.distances[i]['text'];
				}
			}
			return val;
		},
		date_w : function(w) { return weekdays_es[parseInt(w)-1]; },
		date_m : function(m) { return months_es[parseInt(m)-1]; },
		date_y : function(y) { return '20' + y; },
		distance_num : function(d) {
			return isNumeric(d) ? d : '';
		},
		month_yymm : function(yymm) {
			var m = months_es[ parseInt(yymm.substr(2,2)) -1 ];
			var y = '20' + yymm.substr(0,2);
			return m + ' ' + y;
		}
	},
	// ---------------------------
	computed: {
		regions : function() {
			var output = [];
			for ( var i=0; i<this.items.length; i++ ) {
				var c = this.items[i]['region'].toString();
				if ( !inArray(c, output) ) { output.push(c); }
			}
			output.sort();
			return output;
		},
		months : function() {
			var output = [];
			for ( var i=0; i<this.items.length; i++ ) {
				var m = this.items[i]['date_']['yymmdd'].toString().substr(0, 4);
				if ( !inArray(m, output) ) { output.push(m); }
			}
			return output;
		},
		filtered_items : function() {
			var check_dist = function(origin, target) {
				var segment = target.split(',');
				if (segment.length < 2 && !segment[0]) { return false; }

				n_from = parseInt(segment[0]);
				n_to = parseInt(segment[1]) || 1000;
				return ( isNumeric(origin) && origin >= n_from && origin <= n_to ) ? true : false;
			}

			var output = [];
			for ( var i=0; i<this.items.length; i++ ) {
				var remove = false;
				var item = this.items[i];
				if ( this.selected_region != '' && item['region'] != this.selected_region ) { remove = true; }
				if ( this.selected_distance != '' && !check_dist( item['distance'], this.selected_distance ) ) { remove = true; }
				if ( this.selected_date != '' && item['date_']['yymmdd'].substr(0, 4) != this.selected_date ) { remove = true; }

				if ( remove != true ) {  output.push( item ); }
			}
			return output;
		}
	},
	// ---------------------------
	methods: {
		getJSON: function () {
			var self = this;
			var xhr = new XMLHttpRequest();
			xhr.overrideMimeType("application/json");
			xhr.open('GET', json_data_file, true);
			xhr.onreadystatechange = function() {
				if (this.readyState === 4) {
					if (this.status >= 200 && this.status < 400) {
						// Success
						self.items = JSON.parse(this.responseText);

						var h = window.location.hash.slice(3) || false;
						self.enroute(h);
						self.loading = false;

					} else {
						// Error
					}
				}
			};
			xhr.send();
			xhr = null;
		},
		enroute: function(slug) {

			this.get_item(slug);
		},
		do_reset : function() {
			this.enroute(false);
			this.selected_region = '';
			this.selected_distance = '';
			this.selected_date = '';
			this.getJSON();
		},
		get_item : function(slug) {
			var out = {};
			for (var i = 0; i < this.items.length; i++) {
				if (this.items[i].slug === slug) {
					out = this.items[i];
					break;
				}
			}
			this.current_item = out;
		}

	}
	// ---------------------------
});

// Google Analytics
(function(i,s,o,g,r,a,m){i['GoogleAnalyticsObject']=r;i[r]=i[r]||function(){
(i[r].q=i[r].q||[]).push(arguments)},i[r].l=1*new Date();a=s.createElement(o),
m=s.getElementsByTagName(o)[0];a.async=1;a.src=g;m.parentNode.insertBefore(a,m)
})(window,document,'script','https://www.google-analytics.com/analytics.js','ga');

ga('create', 'UA-63335-25', 'auto');
ga('send', 'pageview');
