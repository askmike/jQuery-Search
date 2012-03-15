# Search jQuery plugin

Search is a jQuery plugin that sets up a clientsided word filter on an input field (for direct input by the user).

If you have lots of data on a page in a pre-defined structure Search will filter and sort all the data based on the input.

## How to use Search

You probably need to configure Search based on your page structure:

    var settings = {
    	container: '#templates', // selector to match the container that holds (nothing but) indexable items
    	single: '.single', // selector for the indexable items
    	singleStructure: [ // the structure of each indexable item
    		{
    			elem: 'h3',
    			score: 3 // the importance of hits found in this element
    		},
    		{
    			elem: 'textarea',
    			score: 1
    		}
    	]
    };

    $('#filterInput').search(settings);

Now you can filter using:

* The input field (hit spacebar to submit)
* `$(input).search(['word1', 'word2']);`
* `$(input).search('word1 word2');`

## Advanced

Search binds an keydown event to the input. Search checks for either an empty input field (reset) or a spacebar. 

You can only bind Search to one input element at this moment, you can only bind the search once.

When you pass either an object or nothing into Search it will only set up the filter based on the settings in the object, or the defaults (displayed above). When you pass either an array with words or a string with words (seperated by spaces) to Search it will set up the filter if this hasn't been done already and search on those words. It will also update the input field to reflect the query.

At the end of the filter process (and when we set the filter up) we take all the `single`'s off dom to manipulate (hide and sort) them all at the same time. Therefor you should be careful when binding stuff on those elements natively (and use `.on` or `.live` instead).

When you search by accessing the function, Search returns the number of hits

## Todo:

* A way to re-initialize the filter

## Author

Mike van Rossum, [The Next Web](http://thenextweb.com)