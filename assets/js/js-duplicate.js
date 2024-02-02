let duplicates = document.querySelectorAll('.js-duplicate');
duplicates.forEach(node => {
    let dup = node.cloneNode(true);
    dup.classList.add('clone')
    node.insertAdjacentElement('afterend', dup);
});