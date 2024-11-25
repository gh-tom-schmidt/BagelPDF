//--------------------------------------------- INPUT ---------------------------------------------------------

let name_original_pdf

//--------------------------------------------- DEFINE ---------------------------------------------------------

const id_original_pdf_container = "original-pdf"
const id_new_pdf_container = "new-pdf"
const id_button_left = "left-arrow"
const id_button_right = "right-arrow"
const id_button_save = "save-pdf"

const id_original_button_push_up = "original-button-push-up";
const id_original_button_next_page = "original-button-next-page";
const id_original_button_zoomin = "original-button-zoomin";
const id_original_button_zoomout = "original-button-zoomout";
const id_original_buttom_prev_page = "original-buttom-prev-page";
const id_original_buttom_push_down = "original-buttom-push-down";
const id_new_button_push_up = "new-button-push-up";
const id_new_button_next_page = "new-button-next-page";
const id_new_button_zoomin = "new-button-zoomin";
const id_new_button_zoomout = "new-button-zoomout";
const id_new_buttom_prev_page = "new-buttom-prev-page";
const id_new_buttom_push_down = "new-buttom-push-down";

const class_focus = "focus"
const class_popup = "popup"

const key_left = 'd'
const key_right = 'f'

const setting_scroll_update_time = 300

//-------------------------------------- GLOBALS STATIC ELEMENTS -----------------------------------------------

let pdf_document
let pdf_raw

let original_pdf_container
let new_pdf_container

let button_left
let button_right
let button_save

let original_button_push_up;
let original_button_next_page;
let original_button_zoomin;
let original_button_zoomout;
let original_buttom_prev_page;
let original_buttom_push_down;
let new_button_push_up;
let new_button_next_page;
let new_button_zoomin;
let new_button_zoomout;
let new_buttom_prev_page;
let new_buttom_push_down;


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
    if (new_pages.length > 0) {
        
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
    if (original_pages.length > 0) {
        
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

function scrollTo(page) {
    // bring the new element to focus
    page.scrollIntoView({
        // smooth scrolling animation
        behavior: 'smooth',
        // keep the current vertical position
        block: 'nearest', 
        // center the element horizontally
        inline: 'center'
    });
}

function jump(page) {
    // bring the new element to focus
    page.scrollIntoView({
        // smooth scrolling animation
        behavior: 'auto',
        // keep the current vertical position
        block: 'nearest', 
        // center the element horizontally
        inline: 'center'
    });
}

function moveHorizontal(pdf_container, page){
    // remove element from the current container
    page.parentNode.removeChild(page);

    let focused = focus_elements[pdf_container.id];

    // check if we place the page between or at the end
    if (focused && focused.nextSibling) {
        pdf_container.insertBefore(page, focused.nextSibling);
    }else {
        pdf_container.appendChild(page);
    }

    scrollTo(page)
    updateFocusFull();
}

function moveUp(page){
    if (page.previousElementSibling) {
        page.parentNode.insertBefore(page, page.previousElementSibling);
    }
    scrollTo(page)
}

function moveDown(page){
    if (page.nextElementSibling) {
        // to use insert Before, we move the next page up
        // instead  of the page down
        page.parentNode.insertBefore(page.nextElementSibling, page);
    }
    scrollTo(page)
}

async function reRender(pdf_container, scale) {

    // get the id of the prev focused element
    let prev_focused = focus_elements[pdf_container.id].id

    // get each canvas
    let canvases = pdf_container.getElementsByTagName('canvas');
    // store the id's to delete the canvases 
    let id_canvases = []
    for (let i = 0; i < canvases.length; i++) {
        id_canvases.push(canvases[i].id)
    }

    // clear the old canvases
    pdf_container.innerHTML = '';

    // pdf.js indexing from 1 to n
    for (const element of id_canvases) {

        // convert the string element to a real number
        const page = await pdf_document.getPage(Number(element));

        // create a canvas element for rendering the page
        const canvas = document.createElement('canvas')
        const context = canvas.getContext('2d')
        
        // adjust scale for better rendering
        const viewport = page.getViewport({ scale })

        // Set canvas size to match the page size
        canvas.width = viewport.width
        canvas.height = viewport.height

        // give the canvas a unique id
        canvas.id = element;

        // restore the original focused element
        if (prev_focused == element) {
            focus_elements[pdf_container.id] = canvas
        }

        // render the page to the canvas context
        await page.render({
            canvasContext: context,
            viewport: viewport
        }).promise;

        // append the canvas to the container
        pdf_container.appendChild(canvas);

    }
    
    // jump to original position
    jump(focus_elements[pdf_container.id])
    updateFocusSmall(pdf_container)

}

// check for web vs local file
async function fetchPdf(url) {
    if (url.startsWith("file:///")) {
        original_pdf = await fileSelectorPopup();
        return original_pdf
    } else {
        original_pdf = await fetch(url);
        return original_pdf
    }
}

// create a promis for the manuel file selection
function fileSelectorPopup() {
    return new Promise((resolve, reject) => {
        const dialog = document.createElement('div');
        dialog.classList.add(class_popup)

        const message = document.createElement('p');
        message.textContent = "Cannot open local files. Please select a file.";
        dialog.appendChild(message);

        // file input button
        const fileInput = document.createElement('input');
        fileInput.type = 'file';
        fileInput.accept = ".pdf";
        // trigger this programmatically
        fileInput.style.display = 'none';
        fileInput.addEventListener('change', event => {
            const file = event.target.files[0];
            if (file) {
                document.body.removeChild(dialog); 
                resolve(file); 
            } else {
                reject(new Error("No file selected"));
            }
        });

        const openButton = document.createElement('button');
        openButton.textContent = 'Open File Selector';
        openButton.addEventListener('click', () => fileInput.click());
        dialog.appendChild(openButton);

        document.body.appendChild(dialog);
    });
}

async function savePdf() {
    // we have to get he pdf and extract each page again
    // because the pdf is drawn to the canvas in a other format 

    // load the pdf-document
    const original_pdf = await PDFLib.PDFDocument.load(pdf_raw);

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
}


//----------------------------------------------- CODE ----------------------------------------------------------

// load the original pdf page by page
window.addEventListener('load', async function() {

    // get the URL from the tab and load the pdf
    name_original_pdf = window.PDF_URL;

    //----------------------------------- GLOBALS STATIC ELEMENTS -----------------------------------------------

    original_pdf_container = document.getElementById(id_original_pdf_container);
    new_pdf_container = document.getElementById(id_new_pdf_container);

    button_left = document.getElementById(id_button_left)
    button_right = document.getElementById(id_button_right)
    button_save = document.getElementById(id_button_save)

    original_button_push_up = document.getElementById(id_original_button_push_up);
    original_button_next_page = document.getElementById(id_original_button_next_page);
    original_button_zoomin = document.getElementById(id_original_button_zoomin);
    original_button_zoomout = document.getElementById(id_original_button_zoomout);
    original_buttom_prev_page = document.getElementById(id_original_buttom_prev_page);
    original_buttom_push_down = document.getElementById(id_original_buttom_push_down);
    new_button_push_up = document.getElementById(id_new_button_push_up);
    new_button_next_page = document.getElementById(id_new_button_next_page);
    new_button_zoomin = document.getElementById(id_new_button_zoomin);
    new_button_zoomout = document.getElementById(id_new_button_zoomout);
    new_buttom_prev_page = document.getElementById(id_new_buttom_prev_page);
    new_buttom_push_down = document.getElementById(id_new_buttom_push_down);

    //---------------------------------------- RENDER PDF -------------------------------------------------------
    
    let scale = 1
    let scale_step = 0.1

    fetchPdf(name_original_pdf)
    .then(response => response.arrayBuffer())
    // use async and await to make sure that the pages get rendert in the original order
    .then(async data => {
        // store the raw pdf data to use later
        // keep sure to make a copy, to not automatically detache the data
        pdf_raw = data.slice(0); 

        // load the pdf-document
        pdf_document = await pdfjsLib.getDocument(data).promise;
        
        // pdf.js indexing from 1 to n
        for (let i = 1; i <= pdf_document.numPages; i++) {
            
            const page = await pdf_document.getPage(i);

            // create a canvas element for rendering the page
            const canvas = document.createElement('canvas')
            const context = canvas.getContext('2d')
            
            // adjust scale for better rendering
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
        savePdf()
    });

    button_left.addEventListener('click', () => {
        // check if we have an element to move
        if (focus_elements[id_new_pdf_container]) {
            moveHorizontal(original_pdf_container, focus_elements[id_new_pdf_container]);
            updateFocusFull()
        }

    });

    button_right.addEventListener('click', () => {
        // check if we habe an element to move
        if (focus_elements[id_original_pdf_container]) {
            moveHorizontal(new_pdf_container, focus_elements[id_original_pdf_container]);
            updateFocusFull()
        }
    });

    original_button_push_up.onclick = () => {
        moveUp(focus_elements[id_original_pdf_container])
    };
    original_button_next_page.onclick = () => {
        if (focus_elements[id_original_pdf_container].previousElementSibling) {
            scrollTo(focus_elements[id_original_pdf_container].previousElementSibling)
        }
    };
    original_button_zoomin.onclick = () => {
        scale = scale + scale_step
        reRender(original_pdf_container, scale)
    };
    original_button_zoomout.onclick = () => {
        scale = scale - scale_step
        reRender(original_pdf_container, scale)
    };
    original_buttom_prev_page.onclick = () => {
        if (focus_elements[id_original_pdf_container].nextElementSibling) {
            scrollTo(focus_elements[id_original_pdf_container].nextElementSibling)
        }
    };
    original_buttom_push_down.onclick = () => {
        moveDown(focus_elements[id_original_pdf_container])
    };

    new_button_push_up.onclick = () => {
        moveUp(focus_elements[id_new_pdf_container])
    };
    new_button_next_page.onclick = () => {
        if (focus_elements[id_new_pdf_container].previousElementSibling) {
            scrollTo(focus_elements[id_new_pdf_container].previousElementSibling)
        }
    };
    new_button_zoomin.onclick = () => {
        scale = scale + scale_step
        reRender(new_pdf_container, scale)
    };
    new_button_zoomout.onclick = () => {
        scale = scale - scale_step
        reRender(new_pdf_container, scale)
    };
    new_buttom_prev_page.onclick = () => {
        if (focus_elements[id_new_pdf_container].nextElementSibling) {
            scrollTo(focus_elements[id_new_pdf_container].nextElementSibling)
        }
    };
    new_buttom_push_down.onclick = () => {
        moveUp(focus_elements[id_new_pdf_container])
    };

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


    







 


