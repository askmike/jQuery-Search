/*
		search jQuery plugin

author: Mike van Rossum

requires jQuery (1.4+)

this jQuery plugin sets up a javascript based filter on an input field.

It works on elements that all have the same structure (but different content).

first create an object:

	var settings = {
		container: '#templates', // selector for container that holds (nothing but) indexable items
		single: '.single', // selector for the indexable items
		singleStructure: [ // all text elems inside single you want indexed
			{
				elem: 'h3',
				score: 3 // score for template if elem contains the searched words
			},
			{ //etc..
				elem: '.content',
				score: 1
			}
		]
	}

	$(input).search(settings);
	
	//you can now filter by typing words in the input and hit spacebar
	
	//or filter like this
	$(input).search(['word1', 'word2']);
	//or like this
	$(input).search('word1 word2');
	
*/
;(function( $ ){

	$.fn.search = function( parameter ) {  
		
		// prepare paremeter	
		var wordsParam = [],
			options,
			data = this.data('search'),
			search = this,
			output;

		if( typeof parameter === 'string' ) {
			wordsParam = parameter.split(' ');
		} else if( typeof parameter === 'array' ) {
			wordsParam = parameter;
		} else if ( typeof parameter === 'object' ) {
			options = parameter;
		}

		// define default settings
		var 
			settings = $.extend({
			'container': '#templates',
			'single': '.single',
			'singleStructure': 
				[
					{
						'elem': 'h3',
						'score': 3
					},
					{
						'elem': 'textarea',
						'score': 1
					}
				]
			}, options),
			data = search.data('search'),
			inited = true;

		if( !data ) {
			
			var container = $( settings.container );
			
			inited = false;

			data = {
				search: search,
				singleElems: [],
				templates: [],
				included: [],
				scoreBoard: [],
				container: container,
				singles: container.find( settings.single ),
				settings: settings
			};
			
			var
				/*
				this function searches the DOM for all templates 
				and adds them to the templates array
				*/
				init = function() {

					var structure = data.settings.singleStructure;

					//put all the score multipliers in scoreboard and cache all elems
					for( var len = structure.length, i = 0; i < len; i++ ) {
						data.scoreBoard.push( structure[i].score );
						data.singleElems.push( structure[i].elem );
					}
			
					// take singles off dom, give them a start position, store the (to be indexed) text and re-attach to the dom
					data.singles.detach().each(function(i){
					
						$( this ).data( 'position', i );
					
						var temp = [];
					
						for( var len = data.singleElems.length, j = 0; j < len; j++ ) {
							temp.push( data.singles.eq(i).find(data.singleElems[j]).text() );
						}
					
						data.templates.push({
							text: temp,
							score: 0
						});
						
					}).appendTo( data.container );
					
					// if an search input is provided, let's watch it.
					watchInput();
					output = data.templates.length;

					search.data('search', data);

				};
			}
				
				
			
			/*
			This function takes an array of words as input and 
			*/
			var	query = function( words ) {
			
					//reset the score and the results array
					clean();
			
					// every word
					for( var lenI = words.length, i = 0; i < lenI; i++ ) {
						var	word = words[i];
			
						// in every template
						for( var lenJ = data.templates.length, j = 0; j < lenJ; j++ ) {
			
							var template = data.templates[j],
							filter = new RegExp( '\\b' + word + '\\b', 'gi' );
			
			
							// in every element of every template
							for( var lenK = data.singleElems.length, k = 0; k < lenK; k++ ) {
			
								if( filter.test(template.text[k]) ) {
									//the word is in the elem
									template.score += data.scoreBoard[k];
			
									//if it's a new word
									if( $.inArray( j, data.included ) < 0 ){
										//it's not in the array yet
										data.included.push( j );
									}
								}
							}
						}
					}
			
					//remove low hits
					var treshold = words.length; //Math.floor((words.length + 1) / 2);
			
					build( treshold );
				},
				/*
				this funcion resets all scores to 0
				*/
				clean = function() {
					for( var i = data.templates.length; i-- ; ) {
						data.templates[i].score = 0;
					}
			
				},
				/*
				this functions hides all singles that are either not in included or have a to low score
				it additionally sorts all singles based on the score
				*/
				build = function( treshold ) {
			
					function scoreSort( a, b ) {
						return $( a ).data( 'score' ) < $( b ).data( 'score' ) ? 1 : -1;
					}
			
					function positionSort( a, b ) {
						return $( a ).data( 'position' ) > $( b ).data( 'position' ) ? 1 : -1;
					}
					output = 0;
			
					// take them off dom, manip and put them back
					// we need to sort because templates needs to be mapped to singles
					data.singles.detach().sort( positionSort ).each(function(i) {
						var $this = $( this );
			
						$this.hide().data( 'score', data.templates[i].score );
			
						// console.log('pos: ' + $this.data('position') + '\tscore: ' + $this.data('score') + '\t' + $this.find('h3').text())
			
						//if this template is not included or if this index number does not meet the treshold
						if( $.inArray(i, data.included) != -1 && treshold <= data.templates[i].score ) {
							$this.show();
							output++;
						}
					});
			
					data.singles.sort( scoreSort );
					data.container.append( data.singles );
			
					//we need to requery because we just changed them
					data.singles = data.container.find( data.settings.single );
			
				},
				/*
				this function watches an input field for 
				spacebars and filters upon
				*/
				watchInput = function() {
					
					var search = data.search;
					
					search.keyup(function( e ) {
			
						//if input is empty display all results
						if( search.val() == '' ) {
							query([' ']);
							return;
						}
			
						if( e.which == 32 ) { // = spacebar
							var
								words = [],
								input = search.val().split(' ');
			
							for( var i = 0, len = input.length; i < len; i++ ) {
								if( input[i] != '' ) {
									words.push( input[i] );
								}
							}
			
							query( words );
			
						}
					});
				},
				filter = function( words, input ) {
					query( words );
			
					//add query to input
					if( !input && words[0] != ' ' ) { //it's not a reset
					var string = words.join(' ') + ' ';
					data.search.val( string );
				}
			};


			// init if its the first time
			if( !inited ) {
				init();
			} 
			
			// filter if we searched for words
			if( wordsParam.length) {
				query( wordsParam );
			}
			
			return output;
		};
})( jQuery );
