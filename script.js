//--------------------------------------------- INPUT ---------------------------------------------------------

const name_original_pdf = "test.pdf"
let original_pdf
//--------------------------------------------- DEFINE ---------------------------------------------------------

const id_original_pdf_container = "original-pdf"
const id_new_pdf_container = "new-pdf"
const id_button_left = "left-arrow"
const id_button_right = "right-arrow"
const id_button_save = "save-pdf"

const class_focus = "focus"

const key_left = 'd'
const key_right = 'f'

const setting_scroll_update_time = 300

//-------------------------------------- GLOBALS STATIC ELEMENTS -----------------------------------------------

let original_pdf_container
let new_pdf_container

let button_left
let button_right
let button_save 

//--------------------------------------------- GLOBALS ---------------------------------------------------------

let focus_elements = {
    id_original_pdf_container : null,
    id_new_pdf_container: null
}

let lastExecution = 0;

//-------------------------------------------- FUNCTIONS --------------------------------------------------------

// update the focus
function updateFocusFull(){

    // clear focus elements
    focus_elements[id_original_pdf_container] = null;
    focus_elements[id_new_pdf_container] = null;

    // get all pages (canvases) from each container
    let new_pages = new_pdf_container.getElementsByTagName('canvas');
    let original_pages = original_pdf_container.getElementsByTagName('canvas');

    // if we have pages
    if (new_pages) {
        
        let closestDistance = Infinity;

        // check for the closest
        for (let i = 0; i < new_pages.length; i++){
            // remove any focus classes
            new_pages[i].classList.remove(class_focus)

            // get the center of the element
            const rect = new_pages[i].getBoundingClientRect();
            const elementCenter = (rect.top + rect.bottom) / 2;

            // calculate the distance from the element center to the viewport center
            const distanceToCenter = Math.abs(window.innerHeight / 2 - elementCenter);

            // check if this element is closer to the center than the previous one
            if (distanceToCenter < closestDistance) {
                closestDistance = distanceToCenter;
                focus_elements[id_new_pdf_container] = new_pages[i];
            }
        }

        // add the new style
        focus_elements[id_new_pdf_container].classList.add(class_focus)
    }

    // if we have pages
    if (original_pages) {
        
        let closestDistance = Infinity;

        // check for the closest
        for (let i = 0; i < original_pages.length; i++){
            // remove any focus classes
            original_pages[i].classList.remove(class_focus)

            // get the center of the element
            const rect = original_pages[i].getBoundingClientRect();
            const elementCenter = (rect.top + rect.bottom) / 2;

            // calculate the distance from the element center to the viewport center
            const distanceToCenter = Math.abs(window.innerHeight / 2 - elementCenter);

            // check if this element is closer to the center than the previous one
            if (distanceToCenter < closestDistance) {
                closestDistance = distanceToCenter;
                focus_elements[id_original_pdf_container] = original_pages[i];
            }
        }

        // add the new style
        focus_elements[id_original_pdf_container].classList.add(class_focus)
    }
}

// update the focus on scroll (less calculations)
function updateFocusSmall(pdf_container){

    let element = focus_elements[pdf_container.id];

    // if there is a focus element
    if (element) {

        // remove the old style
        element.classList.remove(class_focus)

        let closestDistance = Infinity;
        let to_check = [];

        // save the old focus element id for style changes
        let prev_id = element.id;

        // push the element to the list
        to_check.push(element)

        // check if there are a previous and a following element
        if (element.previousElementSibling) {
            to_check.push(element.previousElementSibling)
        };
        if (element.nextElementSibling) {
            to_check.push(element.nextElementSibling)
        };

        // check for the closest
        to_check.forEach(element => {
            // get the center of the element
            const rect = element.getBoundingClientRect();
            const elementCenter = (rect.top + rect.bottom) / 2;
        
            // calculate the distance from the element center to the viewport center
            const distanceToCenter = Math.abs(window.innerHeight / 2 - elementCenter);
        
            // check if this element is closer to the center than the previous one
            if (distanceToCenter < closestDistance) {
                closestDistance = distanceToCenter;
                focus_elements[pdf_container.id] = element;
            }
        });

        // add the new style
        focus_elements[pdf_container.id].classList.add(class_focus)

    // if there is not a focus element, check if there is any element in the container 
    }else if(pdf_container.firstElementChild) {
        // set the focus element
        focus_elements[pdf_container.id] = pdf_container.firstElementChild;
        // update style
        focus_elements[pdf_container.id].classList.add(class_focus);
    }
}

function move(pdf_container, page){
    // remove element from the current container
    page.parentNode.removeChild(page);

    let focused = focus_elements[pdf_container.id];

    // check if we place the page between or at the end
    if (focused && focused.nextSibling) {
        pdf_container.insertBefore(page, focused.nextSibling);
    }else {
        pdf_container.appendChild(page);
    }

    // bring the new element to focus
    page.scrollIntoView({
        // smooth scrolling animation
        behavior: 'smooth',
        // keep the current vertical position
        block: 'nearest', 
        // center the element horizontally
        inline: 'center'
    });

    updateFocusFull();
}

//----------------------------------------------- CODE ----------------------------------------------------------

// load the original pdf page by page
window.addEventListener('load', async function() {

    original_pdf = await fetch(name_original_pdf);

    //----------------------------------- GLOBALS STATIC ELEMENTS -----------------------------------------------

    original_pdf_container = document.getElementById(id_original_pdf_container);
    new_pdf_container = document.getElementById(id_new_pdf_container);

    button_left = document.getElementById(id_button_left)
    button_right = document.getElementById(id_button_right)
    button_save = document.getElementById(id_button_save)

    //---------------------------------------- RENDER PDF -------------------------------------------------------
    
    fetch(name_original_pdf)
    .then(response => response.arrayBuffer())
    // use async and await to make sure that the pages get rendert in the original order
    .then(async data => {
        // load the pdf-document
        const pdf_document = await pdfjsLib.getDocument(data).promise;
            
        // pdf.js indexing from 1 to n
        for (let i = 1; i <= pdf_document.numPages; i++) {
            
            const page = await pdf_document.getPage(i);

            // create a canvas element for rendering the page
            const canvas = document.createElement('canvas')
            const context = canvas.getContext('2d')
            
            // adjust scale for better rendering
            const scale = 1; 
            const viewport = page.getViewport({ scale })

            // Set canvas size to match the page size
            canvas.width = viewport.width
            canvas.height = viewport.height

            // give the canvas a unique id
            canvas.id = i;

            // render the page to the canvas context
            await page.render({
                canvasContext: context,
                viewport: viewport
            }).promise;

            // append the canvas to the container
            original_pdf_container.appendChild(canvas);
        }

        updateFocusSmall(original_pdf_container)

    });

    //------------------------------------ INTERACTION LOGIC -------------------------------------------------------
    

    // update focus on each scroll
    original_pdf_container.addEventListener('scroll', () => {
        // prevent multiple fireing in short time 
        const now = Date.now();
        // execute every n ms
        if (now - lastExecution >= setting_scroll_update_time) { 
            updateFocusSmall(original_pdf_container)
            lastExecution = now;
        }
    });

    new_pdf_container.addEventListener('scroll', () => {
        // prevent multiple fireing in short time 
        const now = Date.now();
        // execute every n ms
        if (now - lastExecution >= setting_scroll_update_time) { 
            updateFocusSmall(new_pdf_container)
            lastExecution = now;
        }
    });

    // button functionality
    button_save.addEventListener('click', () => {
        // we have to get he pdf and extract each page again
        // because the pdf is drawn to the canvas in a other format 
        fetch(name_original_pdf)
        .then(response => response.arrayBuffer())
        // use async and await to make sure that the pages get rendert in the original order
        .then(async data => {
            // load the pdf-document
            const original_pdf = await PDFLib.PDFDocument.load(data);
 
            //create a new pdf
            const new_pdf = await PDFLib.PDFDocument.create();
            
            // get each canvas
            let canvases = new_pdf_container.getElementsByTagName('canvas');

            // canvases have id's from 1 to n and
            // the original pdf loaded wiht pdf-lib has id's from 0 to n-1
            for (let i = 0; i < canvases.length; i++) {
                // convert the page into a new page in the new pdf
                const [copiedPage] = await new_pdf.copyPages(original_pdf, [canvases[i].id - 1]);
                // add the copied page to the new pdf
                new_pdf.addPage(copiedPage);
            }
            
            // serialize the document to bytes
            const pdfBytes = await new_pdf.save();

            // create a Blob from the bytes and trigger a download
            const blob = new Blob([pdfBytes], { type: 'application/pdf' });
            const link = document.createElement('a');
            link.href = URL.createObjectURL(blob);
            link.download = 'stript-' + name_original_pdf;
            link.click();
        });
    });

    button_left.addEventListener('click', () => {
        // check if we have an element to move
        if (focus_elements[id_new_pdf_container]) {
            move(original_pdf_container, focus_elements[id_new_pdf_container]);
            updateFocusFull()
        }

    });

    button_right.addEventListener('click', () => {
        // check if we habe an element to move
        if (focus_elements[id_original_pdf_container]) {
            move(new_pdf_container, focus_elements[id_original_pdf_container]);
            updateFocusFull()
        }
    });

    // use keys instead of buttons
    document.addEventListener('keydown', function(event) {
        if (event.key === key_left) {
            button_left.click();
        }

        if (event.key === key_right) {
            button_right.click();
        }
    });

});


    







 


