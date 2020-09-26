// Load a book from disk

function LoadBook(fileName, displayName) {
    let currentBook = "";
    let url = "/books/" + fileName;

    // reset our UI 
    // resets the UI so it displays the name of the loaded book and stats

    document.getElementById('filename').innerHTML = displayName;
    document.getElementById('searchstat').innerHTML = "";
    document.getElementById('keyword').value = "";

    // create a server request to load our book 

    // we make a new request, specify the URL, then send the request
    let xhr = new XMLHttpRequest();
    xhr.open('GET', url, true);
    xhr.send();

    // --------------

    // after the request is sent, we check if there are any changes to our xhr 
    //if there is a change, the anonymous function will be executed

    //readystate has 4 numbers .. 0 means its unsent, 1 means its open, 2 means its received information about the request, 3 means its loading the file back, 4 means it is done

    // we also check HTTP status to see if it is 200 and not 404
    xhr.onreadystatechange = function () {
        // we could also use xhr.onload - everything is the same, we just dont check the readyState .. biggest difference is that onload will not run unless its ready
        if (xhr.readyState == 4 && xhr.status == 200) {
            // responseText is the contents of the file it's just read
            currentBook = xhr.responseText;

            // after we've gotten our book, now we call the function to get our document statistics

            GetDocStats(currentBook);

            // we've got our text into our circulation but it is a one continuous blob of text. There are no line breaks, nothing. We can add that with regular expressions .. its just like checking if a mail is of correct format

            currentBook = currentBook.replace(/(?:\r\n|\r|\n)/g, '<br>');

            // upper command literally checks if there are new lines \n or line breaks in the text and replaces them with the <br> html element

            // set the read text to the main content area
            document.getElementById('fileContent').innerHTML = currentBook;

            // scroll to the top if we select a new book 
            let elmnt = document.getElementById('fileContent');
            elmnt.scrollTop = 0;
        }
    }
}

// DOCUMENT WORD STATISTICS

function GetDocStats(fileContent) {
    let docLength = document.getElementById('docLength');
    let wordCount = document.getElementById('wordCount');
    let charCount = document.getElementById('charCount');

    let text = fileContent.toLowerCase();

    // we will use a regular expression that will check if we have a space or a break.. whenever we have that, it will put that sequence of characters in an array

    let wordArray = text.match(/\b\S+\b/g);

    // we have now got an array of lowercase words from out fileContent..
    // array = a sequence of objects where each one has its number according to the sequence .. 0, 1, 2, 3, 4 
    // dictionary = a collection of objects where each has its corresponding value .. harry = 4532, potter = 9803, sorcerer = 4214 .. each word object has its value 

    // we declare an empty object
    // var person = {firstName:"John", lastName:"Doe", age:50, eyeColor:"blue"}
    // this here is an object

    let wordDictionary = {};

    // empty array for uncommon words

    let uncommonWords = [];

    // call the function to filter out stop words and update our empty uncommonWords array

    uncommonWords = FilterStopWords(wordArray);

    // looping through the (whole array of words / not anymore, since we have stopwords to filter out) uncommon words array from the document and incrementing value +1 every time we hit it 

    for (let word in uncommonWords) {
        let wordValue = uncommonWords[word];

        if (wordDictionary[wordValue] > 0) {
            // 2. every other time it finds it, it increments 1
            wordDictionary[wordValue] += 1;
        } else {
            // 1. first time it finds it, it sets it to 1
            wordDictionary[wordValue] = 1;
        }
    }

    // call the function to sort the array

    let wordList = SortProperties(wordDictionary);

    // return the top 5 words

    let top5Words = wordList.slice(0, 6);
    let least5Words = wordList.slice(-6, wordList.length);

    // write the values to the page 

    ULTemplate(top5Words, document.getElementById("mostUsed"));
    ULTemplate(least5Words, document.getElementById("leastUsed"));

    // get the length of the document
    docLength.innerText = 'Document Length: ' + text.length;

    // number of words
    wordCount.innerText = 'Word Count: ' + wordArray.length;

}

// INJECT the most used and least used words into the predefined template at the end of the HTML 

function ULTemplate(items, element) {
    let rowTemplate = document.getElementById('template-ul-items');
    let templateHTML = rowTemplate.innerHTML;
    let resultsHTML = "";

    // replace the value {{val}} 

    for (i = 0; i < items.length; i++) {
        // replaces {{val}} with i value of array and [0] which corresponds to name and [1] which corresponds to number
        resultsHTML += templateHTML.replace('{{val}}', items[i][0] + " : " + items[i][1] + " time(s)");
    }

    // insert modified resultsHTML to the element we will pass in a function

    element.innerHTML = resultsHTML;
}

// We have now got the statistics how many times a word is repeated

function SortProperties(obj) {
    // we have now got an object with two corresponding values ...
    // a word and a number counting how many times it appeared .. 
    // we need to convert it back to an array

    let rtnArray = Object.entries(obj);

    // we've got the array back and its in this form
    /* rtnArray = [[harry, 1430], [potter, 1200]]  .. value 0 of the array we've got 2 values .. we need to sort which one we use*/

    rtnArray.sort(function (first, second) {
        // we use a compareFunction 
        //https://www.w3schools.com/jsref/jsref_sort.asp#:~:text=The%20sort()%20method%20sorts,in%20alphabetical%20and%20ascending%20order.

        /* Example:When comparing 40 and 100, the sort() method calls the compare function(40,100).The function calculates 40-100, and returns -60 (a negative value).The sort function will sort 40 as a value lower than 100.*/
        return second[1] - first[1];
    })

    return rtnArray;
}

// we define a function that filters any stopword we defined before
// this function works ANYWHERE
/* 1. we defined a function that returns us the array of our defined stop words
   2. then we defined an empty object where we put the array of common words
   3. we define an empty array of uncommon words we want
   4. we put the each stop word inside of an array using a for loop while trimming any spaces
   5. then we loop through our word array and check IF the stopword matches the word in our BOOK
   6. if it DOESN'T, we PUSH the word into our uncommon word array
   7. then at the end return the uncommon word array 
   */

function FilterStopWords(wordArray) {
    // get the common words, define storages for uncommon words
    let commonWords = GetStopWords();
    let commonObj = {};
    let uncommonArr = [];

    for (i = 0; i < commonWords.length; i++) {
        // we've got an object with all of the common words inside of it 
        commonObj[commonWords[i].trim()] = true;
    }

    for (i = 0; i < wordArray.length; i++) {
        // we get every word in our book, trim the spaces and lowercase it 
        word = wordArray[i].trim().toLowerCase();

        // if the passed in word DOESNT MATCH the word in object commonObj, we add it to our uncommonArr array
        if (!commonObj[word]) {
            uncommonArr.push(word);
        }
    }
    // this is now our filtered array, clean of any common word
    return uncommonArr;
}

// we define a function that will filter out the common words such as THE, AS, YOU'RE, YOU'VE because we don't want them counted 

function GetStopWords() {
    // got this off of this link https://stackoverflow.com/questions/5631422/stop-word-removal-in-javascript
    return ['i', 'me', 'my', 'myself', 'we', 'our', 'ours', 'ourselves', 'you', 'your', 'yours', 'yourself', 'yourselves', 'he', 'him', 'his', 'himself', 'she', 'her', 'hers', 'herself', 'it', 'its', 'itself', 'they', 'them', 'their', 'theirs', 'themselves', 'what', 'which', 'who', 'whom', 'this', 'that', 'these', 'those', 'am', 'is', 'are', 'was', 'were', 'be', 'been', 'being', 'have', 'has', 'had', 'having', 'do', 'does', 'did', 'doing', 'a', 'an', 'the', 'and', 'but', 'if', 'or', 'because', 'as', 'until', 'while', 'of', 'at', 'by', 'for', 'with', 'about', 'against', 'between', 'into', 'through', 'during', 'before', 'after', 'above', 'below', 'to', 'from', 'up', 'down', 'in', 'out', 'on', 'off', 'over', 'under', 'again', 'further', 'then', 'once', 'here', 'there', 'when', 'where', 'why', 'how', 'all', 'any', 'both', 'each', 'few', 'more', 'most', 'other', 'some', 'such', 'no', 'nor', 'not', 'only', 'own', 'same', 'so', 'than', 'too', 'very', 's', 't', 'can', 'will', 'just', 'don', 'should', 'now', 'said', 'would'];
}

// perfom search of the keyword 

function PerformMark() {

    // read the keyword from the input 
    let keyword = document.getElementById('keyword').value;
    let display = document.getElementById('fileContent');


    let newContent = '';

    // find all currently marked items 
    let spans = document.querySelectorAll('mark');

    // upper getter gets all elements that look like 
    // <mark>something something</mark>

    for (i = 0; i < spans.length; i++) {
        spans[i].outerHTML = spans[i].innerHTML;
        // this removes the outer HTML or even better .. we are just left with the value that is inside that HTML...
        // <mark>Something</mark> is going to change into just Something
    }

    // this regular expression takes our keyword, evaluates it globally (g) and case-insensitive (i)
    let re = new RegExp(keyword, 'gi');
    // when we call currentContent, it is going to stick it where $& is
    let replaceText = "<mark id='markme'>$&</mark>";

    let bookContent = display.innerHTML;

    // this puts the regular expression inside of those <mark> tags
    newContent = bookContent.replace(re, replaceText);

    display.innerHTML = newContent;
    let count = document.querySelectorAll('mark').length;

    // insert the count into the HTML structure to show it 

    document.getElementById('searchstat').innerHTML = 'found ' + count + " matches";

    // scroll to the first element we found 

    if (count > 0) {
        // we gave IDs of markme to matched keywords
        let element = document.getElementById('markme');
        element.scrollIntoView();
    };
}


/* RUNDOWN OF THE FUNCTIONS:

 1. we load the book from our /books/filename directory
 2. we set the display name in the header of our main content area
 3. reset the UI so with each selection of the book, statistics are an empty string
 4. variable xhr is defined as a new http request
 5. we monitor the changes to that variable .. if anything changes, the anonymous function is then called that we defined in a property ''onreadystatechange''
 6. currentBook variable is populated with .txt that we received from server
 7. immediately we call the GetBookStats function that we defined
 8. that function injects the stats into the bodies of our previously defined HTML structure
 9. we then format the book with regular expressions so that whenever there is a break or a space, another words joins the array
 10. we inject the contents of the formatted book into the fileContent area of our main DIV
 11. scrollTop ensures that whenever a book is loaded, it is reset to the 0 position of the scrollbar
 12.


 GETDOCSTATS function

 1. we get the document in lowered caps
 2. get all the words in the array whenever there's a break or a space
 3. we define an empty object {} that will contain the string and the number of times it repeats
 4. loop through the wordArray based on the wordValue .. everytime we encounter the word, it will add +1 to the wordDictionary, if it encounters it the first time, it will just set it to 1
 5. then we change the wordDictionary from object to array of arrays, each value of array containing 2 values of the dictionary - the name and the number of times it repeats .. using SORTPROPERTIES function
 6. then we take the first 5 and the least used 5 words and inject them into our HTML using ULTemplate function
*/

