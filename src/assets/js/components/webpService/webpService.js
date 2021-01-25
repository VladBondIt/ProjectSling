// // Функция проверки возможности отображения WEBP
export default function testWebP() {

    const partSrc = 'data:image/webp;base64,UklGRjoAAABXRUJQVlA4IC4AAACyAgCdASoCAAIALmk0mk0iIiIiIgBoSygABc6WWgAA/';

    const webP = new Image();
    webP.onload = webP.onerror = function () {
        if (webP.height == 2) {
            document.querySelector('body').classList.add('webp');
        } else {
            document.querySelector('body').classList.add('no-webp');
        }
    };
    webP.src = partSrc + "veff/0PP8bA//LwYAAA";
}