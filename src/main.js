// Dependencies
import $ from 'jquery';
import 'jquery-ui/ui/core';
import 'jquery-ui/ui/widgets/slider.js';
import 'jquery-ui/ui/widgets/autocomplete.js';
import vis from 'vis-network/dist/vis-network.min.js';

// Style 
import 'jquery-ui/themes/base/theme.css';
import 'jquery-ui/themes/base/slider.css';
import 'vis-network/dist/dist/vis-network.min.css';
import './styles/style.css';

//JSON
import sampleConfig from './config.json';

//Images
import ToolImage from './images/tool_centered_sm.png';
import PaperImage from './images/paper_centered_sm.png';
import DatabaseImage from'./images/database_centered_sm.png'
import logoInSoLiTo from './images/logo_InSoLiTo.png';



//Right-Click menu
// From the tool selected, with a right-click event you display a menu to do the following:
// Know which EDAM terms it belongs. 
// Webpage in OpenEBench

function menu(e1) {
	// if node exist
	if (e1.nodes.length === 1) {
		// Take node ID
		var nodeId = e1.nodes[0];
		
		// Initialize menu

		var name = Vis.body.nodes[nodeId].options.properties.name;

		const contextMenu = document.getElementById('context-menu');
		contextMenu.innerHTML = '<div class="item" id="nameTool">' + name + '</div><div class="topicmenu" id="topic"></div><div class="item" id = "webpage"></div>'
		const scope = document.querySelector('body');

		var label = Vis.body.nodes[nodeId].options.properties.label;

		if ('topiclabel' in Vis.body.nodes[nodeId].options.properties) {
			var topiclabel = Vis.body.nodes[nodeId].options.properties.topiclabel;

			// var topicedam = Vis.body.nodes[nodeId].options.properties.topicedam;

			document.getElementById('topic').innerHTML = '';
			for (var i = 0; i < topiclabel.length; i++) {
				var buttonTopic = document.createElement('button');
				buttonTopic.className= 'TopicButton';
				buttonTopic.innerText = topiclabel[i];
				buttonTopic.value = topiclabel[i];
				document.getElementById('topic').appendChild(buttonTopic);
			}
		}


		document.getElementById('webpage').innerHTML = '<button onclick="window.open(&#34;https://openebench.bsc.es/tool/' + label + '&#34; , &#34;_blank&#34; )">Webpage</button>';


		const normalizePozition = (mouseX, mouseY) => {
			// ? compute what is the mouse position relative to the container element (scope)
			let {
				left: scopeOffsetX,
				top: scopeOffsetY,
			} = scope.getBoundingClientRect();

			scopeOffsetX = scopeOffsetX < 0 ? 0 : scopeOffsetX;
			scopeOffsetY = scopeOffsetY < 0 ? 0 : scopeOffsetY;

			const scopeX = mouseX - scopeOffsetX;
			const scopeY = mouseY - scopeOffsetY;

			// ? check if the element will go out of bounds
			const outOfBoundsOnX =
				scopeX + contextMenu.clientWidth > scope.clientWidth;

			const outOfBoundsOnY =
				scopeY + contextMenu.clientHeight > scope.clientHeight;

			let normalizedX = mouseX;
			let normalizedY = mouseY;

			// ? normalize on X
			if (outOfBoundsOnX) {
				normalizedX =
					scopeOffsetX + scope.clientWidth - contextMenu.clientWidth;
			}

			// ? normalize on Y
			if (outOfBoundsOnY) {
				normalizedY =
					scopeOffsetY + scope.clientHeight - contextMenu.clientHeight;
			}

			return { normalizedX, normalizedY };
		};

		scope.addEventListener('click', (event) => {
			// event.preventDefault();
			const { clientX: mouseX, clientY: mouseY } = event;

			const { normalizedX, normalizedY } = normalizePozition(mouseX, mouseY);

			contextMenu.classList.remove('visible');

			contextMenu.style.top = `${normalizedY}px`;
			contextMenu.style.left = `${normalizedX}px`;

			setTimeout(() => {
				contextMenu.classList.add('visible');
			});
		});

		scope.addEventListener('click', (e) => {
			// ? close the menu if the user clicks outside of it
			if (e.target.offsetParent !== contextMenu) {
				contextMenu.classList.remove('visible');
			}
		});
	}
}

function addLogo(){
	var divHomePage = document.getElementById('logo');
	var imgHomePage = document.createElement('img');
	imgHomePage.src = logoInSoLiTo;
	imgHomePage.id= 'imglogo';
	imgHomePage.alt = 'InSoLiTo Logo';
	divHomePage.appendChild(imgHomePage);
}


var Vis;
var nodes;
var edges;
  
function drawVis() {

	nodes = new vis.DataSet();
	// create an array with edges
	edges = new vis.DataSet();
	// create a network
	var container = document.getElementById('VisNetwork');
	var data = {
		nodes: nodes,
		edges: edges,
	};
	var options = {
		layout: {
			randomSeed: 34
		},
		physics: {
			forceAtlas2Based: {
				gravitationalConstant: -200,
				//                             centralGravity: 0.005,
				springLength: 400,
				springConstant: 0.36,
				avoidOverlap: 1
			},
			maxVelocity: 30,
			solver: 'forceAtlas2Based',
			timestep: 1,
			adaptiveTimestep: true,
			stabilization: {
				enabled: true,
				iterations: 2000,
				updateInterval: 25,
				fit:true
			},
		},
		interaction: {
			tooltipDelay: 200,
			navigationButtons: true
		},
		nodes: {
			font:{
				size: 26,
				strokeWidth: 7
			},
			scaling:{},
			shapeProperties: {
				interpolation: false    // 'true' for intensive zooming
			}
		},
		edges:{
			length:200
		}
	}
	Vis = new vis.Network(container, data, options);
}

function createVisVisualization(nodeDataArray, edgeDataArray){
	nodes.add(nodeDataArray);
	edges.add(edgeDataArray);
}
	  
async function postData(url = '', data = {}) {
	const response = await fetch(url, {
		method: 'POST', // *GET, POST, PUT, DELETE, etc.
		headers: {
			'Content-Type': 'application/json',
			'Accept': 'application/json;charset=UTF-8',
			'Access-Mode':'READ',
			'Authorization': (sampleConfig.serverUser + ':' + sampleConfig.serverPassword).toString('base64')
		},
		body: JSON.stringify(data) // body data type must match "Content-Type" header
	});
return response.json(); // parses JSON response into native JavaScript objects
}
  
  
function updateWithCypher(cypherQuery){
	console.log(cypherQuery)
	var inputData= {
		'statements': [
			{
				'statement': cypherQuery,
				'resultDataContents': ['graph']
			},
		]
	}

	postData(sampleConfig.serverUrl,inputData)
		.then(datainput => {
			var edgeDataArray = [];
			var nodeDataArray = [];
			const idNodesSet = new Set();
			Vis.body.nodeIndices.forEach(idNodesSet.add, idNodesSet);
			const idEdgesSet = new Set();
			Vis.body.edgeIndices.forEach(idEdgesSet.add, idEdgesSet);
			datainput.results[0].data.forEach(element => {
				element.graph.nodes.forEach(nodeElement =>{
					if (!idNodesSet.has(nodeElement.id)){
						idNodesSet.add(nodeElement.id)
						if(nodeElement.labels[0]==='Publication'){
							nodeDataArray.push({id:nodeElement.id,
								label: nodeElement.properties.subtitle,
								group: nodeElement.properties.community,
								Neo4jLabel: nodeElement.labels[0],
								properties: nodeElement.properties,
								shape: 'circularImage',
								image: PaperImage,
								title: nodeElement.properties.title
							})
						}
						else{
							var imageLabel;
							if(nodeElement.labels[0]==='Tool'){ 
								imageLabel = ToolImage
							}
							else if (nodeElement.labels[0]==='Database'){
								imageLabel = DatabaseImage
							}
							nodeDataArray.push({id:nodeElement.id,
								label: nodeElement.properties.name,
								group: nodeElement.properties.community,
								Neo4jLabel: nodeElement.labels[0],
								properties: nodeElement.properties,
								shape: 'circularImage',
								image: imageLabel
							});
						}
					}
				});
				element.graph.relationships.forEach(edgeElement =>{
					if (!idEdgesSet.has(edgeElement.id)){
						idEdgesSet.add(edgeElement.id)
						if(edgeElement.type === 'METAOCCUR_ALL'){
							edgeDataArray.push({id: edgeElement.id,
								from: edgeElement.startNode,
								to: edgeElement.endNode,
								value: edgeElement.properties.times,
								color:{inherit:'both'},
							})
						}
						else{
							edgeDataArray.push({id: edgeElement.id,
								from: edgeElement.startNode,
								to: edgeElement.endNode,
								value: edgeElement.properties.times,
								color:{inherit:'both'},
								title:edgeElement.properties.year
							})
						}
						
		
					}
				});
			});
			createVisVisualization(nodeDataArray,edgeDataArray);
		});
}

// Initialize Menu
function initMenu(){
	// When node selected, activate the menu
	Vis.on('selectNode', (e1) => {
		menu(e1);
	});
	// When nodes are not selected, delete the menu
	Vis.on('deselectNode', () => {
		var contextMenu = document.getElementById('context-menu');
		contextMenu.innerHTML = '';
	});
}

const urlParams = new URLSearchParams(window.location.search);
const toolName = urlParams.get('tool') || 'No word provided';
const limitAPI = urlParams.get('limit') || 10;

addLogo();
drawVis();
var cypherQuery = 'MATCH (i)-[o:METAOCCUR_ALL]-(p) where i.name="' + toolName +'" return i,o,p order by o.times limit ' + limitAPI;
updateWithCypher(cypherQuery);
// Initialize Right-click Menu
initMenu();







	
// 	const LoadingImg = document.getElementById('loadingSpinner');
// 	LoadingImg.src= LoadingIcon;
// 	LoadingImg.style.display = 'block';

// 	const list = document.getElementById('loading');
// 	list.style.display = 'block';

// 	// If no results found, wait and put an alert
// 	await new Promise(r => setTimeout(r, 15000));
// 	if (nodes.length === 0 || nodes.length === nodesBeforeQuery) {
// 		alert('No results found. Try again!');
// 		list.style.display = 'none';
// 		// return;
// 	}


// function addLoadingTool (){ 

// 	Vis.stopSimulation();
// 	Vis.off('afterDrawing', addLoadingTool);
// 	// Vis.network.fit();
// 	Vis.stopSimulation();
// 	document.getElementById('loadingSpinner').style.display = 'none';
// 	document.getElementById('loading').style.display = 'none';
// };

// function waitAddTool(){
// 	setTimeout(function(){
// 		Vis.stabilize(100);
// 		Vis.on('afterDrawing', addLoadingTool);
// 	})
// }
