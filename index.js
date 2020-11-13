(function(){

'use strict';

let activeColor = '#ffffff';
const scale = 4;


const canvas = document.getElementById('canvas');
drawCanvas(canvas, scale);
dragPaint(canvas);


const palette = document.getElementById('palette');
const paletteNodes = drawCanvas(palette, scale);
const slice = paletteNodes.length / 4
const satNodes = paletteNodes.slice(0, slice);
const hueNodes = paletteNodes.slice(slice, slice * 2);
const vNodes = paletteNodes.slice(slice * 2, slice * 3);
const greyNodes = paletteNodes.slice(slice * 3);
assignColors(satNodes, 0.5, 1.0); 
assignColors(hueNodes, 1.0, 1.0); 
assignColors(vNodes, 1, 0.5); 
assignGreyscale(greyNodes); 
selectPaint(palette);


let toolbarYPos = 0.5;
const tools = document.getElementById('tools');
const selectedColor = circle(vector(0.5, toolbarYPos++), scale)
selectedColor.setAttribute('fill', activeColor);
tools.appendChild(selectedColor);

// const loadNode = circle(vector(0.5, toolbarYPos++), scale)
// loadNode.setAttribute('fill', 'red');
// tools.appendChild(loadNode);

// const saveNode = circle(vector(0.5, toolbarYPos++), scale)
// saveNode.setAttribute('fill', 'green');
// tools.appendChild(saveNode);

// const clearNode = circle(vector(0.5, toolbarYPos++), scale)
// clearNode.setAttribute('fill', 'black');
// tools.appendChild(clearNode);

function drawCanvas(root, scale){
  const vb = root.viewBox.baseVal;
  const xSize = vb.width / scale;
  const ySize = vb.height / scale;
  let out = [];
  for (let x = 0; x < xSize; x++) {
    for (let y = 0; y < ySize; y++) {
      const r = rect(vector(x, y), scale)
      root.appendChild(r);
      out.push(r);
    }
  }
  return out;
}


function rect(pos, scale) {
  const rect = elem('rect', pos, scale);
  rect.setAttribute('width', scale);
  rect.setAttribute('height', scale);
  return rect;
}


function circle(pos, scale) {
  const circle = elem('circle', pos, scale);
  circle.setAttribute('r', 0.5 * scale);
  return circle;
}


function elem(type, pos, scale) {
  const node = document.createElementNS('http://www.w3.org/2000/svg', type);
  node.setAttribute('transform', `translate(${pos.x * scale}, ${pos.y * scale})`);
  node.setAttribute('fill', '#ffffff');
  node.setAttribute('stroke-width', 0.2);
  node.setAttribute('stroke', '#f5f5f6');
  node.setAttribute('stroke-opacity', 1.0);
  return node;
}


function makeDraggable(root, elem) {
  let p = root.createSVGPoint();
  return root.addEventListener('mousemove', function(event){
    p.x = event.clientX;
    p.y = event.clientY;
    const t = p.matrixTransform(root.getScreenCTM().inverse());
    elem.setAttribute('transform', `translate(${t.x}, ${t.y})`);
  });
}


function dragPaint(root) {

  let dragging = false;

  function startDrag(event) {
    paint(event.target);
    dragging = true;
    event.preventDefault();
    event.stopPropagation();
  }

  function stopDrag(event) {
    dragging = false;
    event.preventDefault();
    event.stopPropagation();
  }

  function drag(event) {
    if(dragging){
      if(event.target) paint(event.target);
      const touches = event.targetTouches;
      if(touches) {
        for (let i = 0; i < touches.length; i++) {
          const touch = touches[i];
          const element = document.elementFromPoint(touch.clientX, touch.clientY);
          paint(element);
        }
      }
      event.preventDefault();
      event.stopPropagation();
    }
  }

  root.addEventListener('mouseleave', stopDrag);
  root.addEventListener('mouseup', stopDrag);
  root.addEventListener('touchend', stopDrag);
  root.addEventListener('mousedown' , startDrag);
  root.addEventListener('touchstart' , startDrag);
  root.addEventListener('mousemove', drag);
  root.addEventListener('touchmove', drag);
}


function clickPaint(root) {
  return root.addEventListener('click', function(event){
    paint(event.target);
  });
}


function paint(node){
  const fill = activeColor;
  node.setAttribute('fill', fill);
}


function selectPaint(root) {
  return root.addEventListener('click', function(event){
    const fill =  event.target.getAttribute('fill');
    console.log(fill)
    setActiveColor(fill)
  });
}


function vector(x, y) {
  return { x, y };
}


function rgb(r, g, b) {
  return `rgb(${r},${g}, ${b})`
}


function assignGreyscale(nodes) {
  let inc = 1 / (nodes.length - 1);
  for(let i = 0, v = 0; i < nodes.length ; i++, v += inc){
    const fill = hsvToRGB(0.0, 0.0, v);
    nodes[i].setAttribute('fill', fill);
  }
}


function assignColors(nodes, s, v) {
  let mul = 360 / (nodes.length - 1);
  for(let i = 0; i < nodes.length ; i++){
    let h = i * mul;
    const fill = hsvToRGB(h / 360, s, v);
    nodes[i].setAttribute('fill', fill);
  }
}


function hsvToRGB(h, s, v) {
  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);
  let r, g, b;
  switch (i % 6) {
      case 0: r = v, g = t, b = p; break;
      case 1: r = q, g = v, b = p; break;
      case 2: r = p, g = v, b = t; break;
      case 3: r = p, g = q, b = v; break;
      case 4: r = t, g = p, b = v; break;
      case 5: r = v, g = p, b = q; break;
  }
  return rgb(Math.round(r * 255), Math.round(b * 255), Math.round(g * 255));
}


function setActiveColor(color){
  activeColor = color;
  selectedColor.setAttribute('fill', activeColor);
}


function save(root){
  const wrapper = {
    values: root.childNodes.values.map((e) => e.getAttribute('fill'))
  };
  return JSON.stringify(wrapper)
}


function load(root, json){
  const wrapper = JSON.parse(json);
  const children = root.childNodes.values();
  if(children.length !== wrapper.length) return false;
  for (let i = 0; i < wrapper.length; i++) {
    children[i].setAttribute('fill', wrapper[i]);
  }
}

}());