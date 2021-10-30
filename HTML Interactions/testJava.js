function SeeWhatHappens() {
    var numRand = Math.floor(Math.random() * 501);
    var divsize = 50;
    var posx = (Math.random() * window.innerWidth - divsize).toFixed();
    var posy = (Math.random() * window.innerHeight - divsize).toFixed();
    var div = document.getElementById('div1');
    div.style.left = posx + 'px';
    div.style.top = posy + 'px';
}
