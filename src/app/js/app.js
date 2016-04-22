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

		/*
		distanceFilter : function(arr, segment) {

			var segment = segment.split(',');
			if (segment.length < 2 && !segment[0]) { return arr; }

			n_from = parseInt(segment[0]);
			n_to = parseInt(segment[1]) || 1000;

			var aux = [];
			for ( var i=0; i<arr.length; i++) {
				var d = arr[i].distance;
				if (
					isNumeric(d)
					&& d >= n_from
					&& d <= n_to
				) {
					aux.push(arr[i]);
				}
			}
			return aux;
		},
		*/
		distanceValue : function(v) {
			var val = '';
			for (var i=0; i<this.distances.length; i++) {
				if ( v == this.distances[i]['value'] ) {
					val = this.distances[i]['text'];
				}
			}
			return val;
		},

		/*
		count: function (arr) {
			var res = arr.length;
			return parseInt(res);
		},
		empty: function(arr) {
			return (arr.length == 0) ? true : '';
		},
		*/

		date_w : function(w) {
			return weekdays_es[parseInt(w)-1];
		},
		date_m : function(m) {
			return months_es[parseInt(m)-1];
		},
		date_y : function(y) {
			return '20' + y;
		},

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
			xhr.open('GET', json_data_file, true);
			xhr.onreadystatechange = function() {
				if (this.readyState === 4) {
					if (this.status >= 200 && this.status < 400) {
						// Success
						self.items = JSON.parse(this.responseText);

						var h = window.location.hash.slice(3) || false;
						self.enroute(h);

					} else {
						// Error
						// TODO: handle error
					}
				}
			};
			xhr.send();
			xhr = null;
		},
		enroute: function(slug) {

			this.get_item(slug);

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
