/*globals define, WebGMEGlobal*/

/**
 * Generated by VisualizerGenerator 1.7.0 from webgme on Tue Aug 02 2022 14:04:10 GMT-0500 (Central Daylight Time).
 */

 define(['jointjs','css!./styles/SimPNWidget.css'], function (joint) {
    'use strict';

    var WIDGET_CLASS = 'sim-p-n';

    function SimPNWidget(logger, container) {
        this._logger = logger.fork('Widget');

        this._el = container;

        this.nodes = {};
        this._initialize();

        this._logger.debug('ctor finished');
    }

    SimPNWidget.prototype._initialize = function () {
        console.log(joint)
        var width = this._el.width(),
            height = this._el.height(),
            self = this;

        // set widget class
        this._el.addClass(WIDGET_CLASS);

        // Create a dummy header
        this._el.append('<h3>SimPN Events:</h3>');

        this._jointSM = new joint.dia.Graph;
        this._jointPaper = new joint.dia.Paper({
            el: this._el,
            width : width,
            height: height,
            model: this._jointSM,
            interactive: false
        });
        
        // add event calls to elements
        this._jointPaper.on('element:pointerclick', function(elementView) {
            if (self._webgmeSM) {
                const id = self._webgmeSM.id2state[elementView.model.id]
                if (self._webgmeSM.states[id].meta_type == "Transition") {
                    const currentElement = self._webgmeSM.states[id]
                    const in_places = currentElement.paths_from
                    const out_places = currentElement.paths_to
                    const isTransitionEnabled = in_places.length == in_places.filter(x => x.tokens>0).length
                    if (isTransitionEnabled && out_places.length > 0) {
                        // iterate in places
                        in_places.forEach(p => {
                            console.log("decrementing tokens for in-places")
                            self._webgmeSM.states[p.id].tokens--
                        })

                        //update the tokens for out_places
                        out_places.forEach(p => {
                            console.log("incrementing tokens for out-places")
                            self._webgmeSM.states[p.id].tokens++
                        })
                        //self._jointPaper.updateViews();
                        self.refresh()
                    } else {
                        //notify user that it is deadlocked
                        console.log("No enabled transition")
                    }         
                }
            }
        });

        this._webgmeSM = null;
    };

    SimPNWidget.prototype.onWidgetContainerResize = function (width, height) {
        this._logger.debug('Widget is resizing...');
    };

    SimPNWidget.prototype.refresh = function () {
        console.log("starting refresh")
        const self = this;
        self._jointSM.clear();
        const sm = self._webgmeSM;
        sm.id2state = {}; // this dictionary will connect the on-screen id to the state id
        // first add the states

        var pn = joint.shapes.pn;
        Object.keys(sm.states).forEach(id => {
            let vertex = null;
            if (sm.states[id].meta_type == "Place") {
                vertex = new pn.Place({
                    position: sm.states[id].position,
                    attrs: {
                        '.label': {
                            'text': `${sm.states[id].name}-${sm.states[id].tokens}`,
                            'fill': '#7c68fc' },
                        '.root': {
                            'stroke': '#9586fd',
                            'stroke-width': 3
                        },
                        '.tokens > circle': {
                            'fill': '#7a7e9b'
                        }
                    },
                    tokens: 1
                });
            } else if (sm.states[id].meta_type == "Transition") {
                vertex = new pn.Transition({
                    position: sm.states[id].position,
                    attrs: {
                        '.label': {
                            'text': sm.states[id].name,
                            'fill': '#fe854f'
                        },
                        '.root': {
                            'fill': '#9586fd',
                            'stroke': '#9586fd',
                            'cursor': 'pointer'
                        }
                    }
                });
            }
            vertex.addTo(self._jointSM);
            sm.states[id].joint = vertex;
            sm.id2state[vertex.id] = id;
        });
        console.log(sm)

        // then create the links
        Object.keys(sm.states).forEach(stateId => {
            const state = sm.states[stateId];
            state.paths_to.forEach(event => {
                state.jointNext = state.jointNext || {};
                const substate = sm.states[event.id]
                // const link = new pn.Link({
                //     source: {id: state.joint.id, selector: '.root'},
                //     target: {id: substate.joint.id, selector: '.root' },
                //     attrs: {
                //         '.connection': {
                //             'fill': 'none',
                //             'stroke-linejoin': 'round',
                //             'stroke-width': '2',
                //             'stroke': '#4b4a67'
                //         }
                //     }
                // });
                const link = new joint.shapes.standard.Link({
                    source: {id: state.joint.id},
                    target: {id: substate.joint.id},
                    attrs: {
                        line: {
                            strokeWidth: 2
                        },
                        wrapper: {
                            cursor: 'default'
                        }
                    },
                    labels: [{
                        position: {
                            distance: 0.5,
                            offset: 0,
                            args: {
                                keepGradient: true,
                                ensureLegibility: true
                            }
                        },
                        attrs: {
                            text: {
                                //text: event.name,
                                fontWeight: 'bold'
                            }
                        }
                    }]
                });
                link.addTo(self._jointSM);
                state.jointNext[event] = link;
            })
        });

        //now refresh the visualization
        self._jointPaper.updateViews();
        self._decorateMachine();
    }
    
    // State Machine manipulating functions called from the controller
    SimPNWidget.prototype.initMachine = function (graph) {
        const self = this;

        self._webgmeSM = graph;
        console.log("doing hit")
        self.refresh()
    };

    SimPNWidget.prototype.CreateLink = function (a, b) {
        return new pn.Link({
            source: { id: a.id, selector: '.root' },
            target: { id: b.id, selector: '.root' },
            attrs: {
                '.connection': {
                    'fill': 'none',
                    'stroke-linejoin': 'round',
                    'stroke-width': '2',
                    'stroke': '#4b4a67'
                }
            }
        });
    };

    SimPNWidget.prototype.destroyMachine = function () {

    };

    SimPNWidget.prototype.fireTransition = function (element, states) {
        console.log("firing transitions")
        element.paths_from.forEach(p => {
            if (p.tokens > 0)
                // console.log(this._webgmeSM)
                // console.log("this hit")
                // console.log(states)
                this._webgmeSM.states[p.id].tokens -= 1
        })

        element.paths_from.forEach(p => {
            this._webgmeSM.states[p.id].tokens += 1
        })
        
        //self._webgmeSM.states
        console.log(element)
    }

    SimPNWidget.prototype.fireEvent = function (event) {
        // const self = this;
        // const current = self._webgmeSM.states[self._webgmeSM.current];
        // const link = current.jointNext[event];
        // const linkView = link.findView(self._jointPaper);
        // linkView.sendToken(joint.V('circle', { r: 10, fill: 'black' }), {duration:500}, function() {
        //    self._webgmeSM.current = current.next[event];
        //    self._decorateMachine();
        // });
    };

    SimPNWidget.prototype.resetPetriNet = function () {
        // this._webgmeSM.current = this._webgmeSM.init;
        // this._decorateMachine();
    };

    SimPNWidget.prototype._decorateMachine = function() {
        const sm = this._webgmeSM;
        Object.keys(sm.states).forEach(stateId => {
            sm.states[stateId].joint.attr('body/stroke', '#333333');
        });
        //sm.states[sm.current].joint.attr('body/stroke', 'blue');
        //sm.setFireableEvents(Object.keys(sm.states[sm.current].next));
    };
    

    // Adding/Removing/Updating items
    SimPNWidget.prototype.addNode = function (desc) {
        if (desc) {
            // Add node to a table of nodes
            var node = document.createElement('div'),
                label = 'children';

            if (desc.childrenIds.length === 1) {
                label = 'child';
            }

            this.nodes[desc.id] = desc;
            node.innerHTML = 'Adding node "' + desc.name + '" (click to view). It has ' +
                desc.childrenIds.length + ' ' + label + '.';

            this._el.append(node);
            node.onclick = this.onNodeClick.bind(this, desc.id);
        }
    };

    SimPNWidget.prototype.removeNode = function (gmeId) {
        var desc = this.nodes[gmeId];
        this._el.append('<div>Removing node "' + desc.name + '"</div>');
        delete this.nodes[gmeId];
    };

    SimPNWidget.prototype.updateNode = function (desc) {
        if (desc) {
            this._logger.debug('Updating node:', desc);
            this._el.append('<div>Updating node "' + desc.name + '"</div>');
        }
    };

    /* * * * * * * * Visualizer event handlers * * * * * * * */

    SimPNWidget.prototype.onNodeClick = function (/*id*/) {
        // This currently changes the active node to the given id and
        // this is overridden in the controller.
    };

    SimPNWidget.prototype.onBackgroundDblClick = function () {
        this._el.append('<div>Background was double-clicked!!</div>');
    };

    /* * * * * * * * Visualizer life cycle callbacks * * * * * * * */
    SimPNWidget.prototype.destroy = function () {
    };

    SimPNWidget.prototype.onActivate = function () {
        this._logger.debug('SimPNWidget has been activated');
    };

    SimPNWidget.prototype.onDeactivate = function () {
        this._logger.debug('SimPNWidget has been deactivated');
    };

    return SimPNWidget;
});
