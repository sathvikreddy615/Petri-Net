# Petri Net Design Studio

## What is the domain about
Petri nets are a mathematical modeling graph used to describe state changes within distributed systems. A simple net contains a Place and a Transition, which are connected through an Arc. Places may contain any number of tokens, and a transition's role is to process these tokens. A transition is only enabled, and will fire, if all of its in places contain at least one token. When a transition fires, it consumes a single input token at a time and distributes that token to one of its out places. This means that the input place will have its token count decrease by 1, while the output place will increase by 1. The state of the Petri net is known as the marking, which represents the distribution of tokens. Places are typically depicted with circles, Transitions with squares, and Arcs connecting Places and Transitions with line-arrows.

## A few sentence on the typical use-cases of the domain

The domanin can be used to:
- gain an understanding about Petri nets
- interpret the modeling language
- simplify complex ideas
- model concurrent and distributed systems

## How to install the design studio

1. Clone this repository
2. Install [Docker Desktop](https://www.docker.com/products/docker-desktop)
3. Install [NodeJS](https://nodejs.org/en/) (LTS recommended)

## How to start modeling once the studio is installed

### Building and launching the containers:

You can launch, build, stop, and debug the Docker containers using the following commands. You can also use the Docker Desktop client to start/stop your containers.

All of the following commands should be used from your main project directory (where this file also should be). Note: Docker Desktop client can also be used for starting and stopping your containes.
- To **start** the server just use `docker-compose -d`
- To **rebuild** the complete solution `docker-compose build` (and follow with the `docker-compose up -d` to restart the server)
- To **start** the server and **rebuild** simultaneously just use `docker-compose -d --build`
- To **debug** using the logs of the WebGME service `docker-compose logs webgme`
- To **stop** the server just use `docker-compose stop`
- To **enter** the WebGME container and use WebGME commands `docker-compose exec webgme bash` (you can exit by simply closing the command line with linux command 'exit') 
- To **clean** the host machine of unused (old version) images `docker system prune -f`

### Connecting to server:

Connect to your local server at http://localhost:8888

### Creating a model:

Before creating your own Petri net models, please see the example models that have been provided under the Root composition tab. Once you have a solid understanding of Petri net, you can get started creating your own models by following these steps:

1. Once the design studio loads, you will want to create a new project by clicking "Create new..." and naming the project

![Create New Project](https://github.com/sathvikreddy615/Petri-Net/blob/main/images/Create_new.png)

2. Choose "PetriNet" from the list options under "Choose an existing seed" and click "Create". This will clone the meta model that you can use to create your own models!

![Clone Existing Seed](https://github.com/sathvikreddy615/Petri-Net/blob/main/images/choose_seed.png)

4. To create a model, look under the Object Browser and drag "PetriNets" onto the screen. Select "Copy Here"

![Copy Here](https://github.com/sathvikreddy615/Petri-Net/blob/main/images/cope_here.png)

5. At the top left of the newly copied node, click the down arrow to drill into the composition

![Drill Down](https://github.com/sathvikreddy615/Petri-Net/blob/main/images/drill_down.png)

7. In this view, you can use the Place and Transition elements to create your very own Petri net. If you hover over either element, 4 squares around the object will pop up. Click one of the squares and drag from one element square to the other element's square to establish a connection.

![Place and Transition](https://github.com/sathvikreddy615/Petri-Net/blob/main/images/Places_Transitions.png)
![Example Model](https://github.com/sathvikreddy615/Petri-Net/blob/main/images/ModelExample.png)

9. Happy modeling!

## Once a network is build, what feature your studio provides and how can the user use those functions

### Classifications:

This Petri net recognizes four classifications, which are described as follows:

- Free-choice petri net - if the intersection of the inplaces sets of two transitions are not empty, then the two transitions should be the same (or in short, each transition has its own unique set if inplaces)
- State machine - a petri net is a state machine if every transition has exactly one inplace and one outplace.
- Marked graph - a petri net is a marked graph if every place has exactly one out transition and one in transition.
- Workflow net - a petri net is a workflow net if it has exactly one source place s where *s =∅, one sink place o where o* =∅, and every x∈P∪T is on a path from s to o.

By following the below steps, you can easily check if your models recognize any of these classifications using the tools built into the design studio.

1. Click "Execute Plug-in" button and select "Classifications Check"

![Execute Plug-in](https://github.com/sathvikreddy615/Petri-Net/blob/main/images/PluginInstructions1.png)

2. Click "Run" button

![Run](https://github.com/sathvikreddy615/Petri-Net/blob/main/images/PluginInstructions2.png)

3. Under the "NOTIFICATIONS" section in the bottom right, you will see a popup that will display a list of the classifications that your model recognized. If your model, did not meet any of the classificationm, it will simply tell you that.

![Plug-in Notification 1](https://github.com/sathvikreddy615/Petri-Net/blob/main/images/PluginNotification1.png)

![Plug-in Notification 2](https://github.com/sathvikreddy615/Petri-Net/blob/main/images/PluginNotification2.png)

### Simulation:

*How to use it:*

The SimPN visualizer can be used to simulate and interact with your model. Looking nearly identical to the Composition model, the user can click on an enabled transitions to fire and progress markings in the network. As you can see in the image below, Places are visualized as blue circles, with the name of the place and number of tokens labeled above it. Enabled Transitions are represented as blue blocks and also have their names labeled above the element. However, if a transition is disabled, the block will be colored red, indicating to the user that the transition cannot be fired at the current state of the net.

![SimPN](https://github.com/sathvikreddy615/Petri-Net/blob/main/images/SimPn.png)

![SimPN Example](https://github.com/sathvikreddy615/Petri-Net/blob/main/images/SimPN_Example.png)

*Resetting the Model:*

The user can reset the model back to its initial state by clicking "Reset Simulator" button in the toolbar. 

*Check Petri net Classifications:*

User has the ability to check if their model recognizes any of the four classifications within the simulator by clicking the "Check Petri net classifications" button in the toolbar. Exactly like the "Execute Plug-in" button, this information will popup in the "NOTIFICATIONS" section of the design studio.
