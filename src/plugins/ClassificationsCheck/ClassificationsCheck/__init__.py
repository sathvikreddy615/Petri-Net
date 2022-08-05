"""
This is where the implementation of the plugin code goes.
The ClassificationsCheck-class is imported from both run_plugin.py and run_debug.py
"""
import sys
import logging
from webgme_bindings import PluginBase

# Setup a logger
logger = logging.getLogger('ClassificationsCheck')
logger.setLevel(logging.INFO)
handler = logging.StreamHandler(sys.stdout)  # By default it logs to stderr..
handler.setLevel(logging.INFO)
formatter = logging.Formatter('%(asctime)s - %(name)s - %(levelname)s - %(message)s')
handler.setFormatter(formatter)
logger.addHandler(handler)


class ClassificationsCheck(PluginBase):
    def main(self):
        core = self.core
        root_node = self.root_node
        active_node = self.active_node

        self.namespace = None
        META = self.META

        def IsFreeChoicePetriNet(graph):
            #Free-choice petri net - if the intersection of the inplaces sets of two transitions are not empty,
            #then the two transitions should be the same (or in short, each transition has its own unique set if inplaces)
            for k in graph.keys():
                pt = graph[k]
                if pt["meta_type"] == "Transition":
                    if len(pt["paths_from"]) == 0:
                        #a Transition does not have an inplace
                        return False
                    else:
                        for p in pt["paths_from"]:
                            in_place = graph[p["id"]]
                            if len(in_place["paths_to"]) == 1 and pt["id"] == in_place["paths_to"][0]["id"]:
                                continue
                            else:
                                return False
            return True
                
        def IsStateMachine(graph):
            #State machine - a petri net is a state machine if every transition has exactly one inplace and one outplace
            for k in graph.keys():
                pt = graph[k]
                if pt["meta_type"] == "Transition":
                    if sum(p["meta_type"] == "Place" for p in pt["paths_from"]) == 1 and sum(p["meta_type"] == "Place" for p in pt["paths_to"]) == 1:
                        continue
                    else:
                        return False
            return True

        def IsMarkedGraph(graph):
            #Marked graph - a petri net is a marked graph if every place has exactly one out transition and one in transition
            for k in graph.keys():
                pt = graph[k]
                if pt["meta_type"] == "Place":
                    if sum(p["meta_type"] == "Transition" for p in pt["paths_from"]) == 1 and sum(p["meta_type"] == "Transition" for p in pt["paths_to"]) == 1:
                        continue
                    else:
                        return False
            return True
            
        def IsWorkflowNet(graph):
            #Workflow net - http://mlwiki.org/index.php/Workflow_Nets      
            for k in graph.keys():
                pt = graph[k]
                if pt["meta_type"] == "Transition" and (len(pt["paths_from"]) == 0 or len(pt["paths_to"]) == 0):
                    #there is a transaction that has no inplace or outplace
                    return False
            
            source = None
            sink = None
            for k in graph.keys():
                pt = graph[k]
                if pt["meta_type"] == "Place":
                    if len(pt["paths_from"]) == 0 and len(pt["paths_to"]) == 0:
                        #there is an issue with the model
                        return False
                    else:
                        if len(pt["paths_from"]) == 0:
                            if source is None:
                                source = pt
                            else:
                                #at least 2 places has no start
                                return False
                        if len(pt["paths_to"]) == 0:
                            if sink is None:
                                sink = pt
                            else:
                                #at least 2 places has no end
                                return False
        
            if source is not None and sink is not None:
                #see if there is a path from source to sink
                source_id = source["id"]
                
                from collections import deque
                visited = []
                visited_nodes = []
                queue = deque()
                
                parent = {}

                visited.append(source_id)
                queue.append(source_id)
                parent[source_id] = None
                
                while queue:
                    s = queue.popleft()
                    for n in graph[s]["paths_to"]:
                        if n["id"] not in visited:
                            v = n["id"]
                            visited.append(v)
                            queue.append(v)
                            visited_nodes.append(n)
                            parent[v] = s
                    
                for e in visited_nodes:
                    v = e["id"]
                    workflows = []
                    while v is not None:
                        workflows.append(v)
                        v = parent[v]
                    workflows.reverse()
                
                if len(workflows) > 0:
                    sinkIdx = len(workflows)-1
                    if workflows[0] == source_id and workflows[sinkIdx] == sink["id"]:
                        return True
            return False

        nodes = core.load_own_sub_tree(active_node)
        path2node = {}
        for node in nodes:
            path2node[core.get_path(node)] = node
            
        graph = {}
        for node in nodes:
            if core.is_instance_of(node, META["Place"]) or core.is_instance_of(node, META["Transition"]):     
                pt_id = core.get_path(node)
                
                pt = {}
                pt["id"] = pt_id
                pt["name"] = core.get_attribute(node, 'name')
                pt["tokens"] = core.get_attribute(node, 'tokens') if core.is_instance_of(node, META["Place"]) else -1
                pt["meta_type"] = core.get_attribute(core.get_meta_type(node), 'name')
                pt["paths_from"] = list()
                pt["paths_to"] = list()
                                        
                for arc in nodes:
                    if core.is_instance_of(arc, META["Arc"]):
                        src_pt = core.get_path(core.get_parent(path2node[core.get_pointer_path(arc, 'src')])) 
                        dst_pt = core.get_path(core.get_parent(path2node[core.get_pointer_path(arc, 'dst')]))
                        if src_pt == pt_id:
                            dst_pt_metanode = core.get_base_type(core.get_parent(path2node[core.get_pointer_path(arc, 'dst')]))
                            pt["paths_to"].append(
                                {
                                    "id":dst_pt,
                                    "name":core.get_attribute(core.get_parent(path2node[core.get_pointer_path(arc, 'dst')]), 'name'),
                                    "meta_type":core.get_attribute(core.get_meta_type(dst_pt_metanode), 'name')
                                }
                            )
                        elif dst_pt == pt_id:
                            src_pt_metanode = core.get_base_type(core.get_parent(path2node[core.get_pointer_path(arc, 'src')]))
                            pt["paths_from"].append(
                                {
                                    "id":src_pt,
                                    "name":core.get_attribute(core.get_parent(path2node[core.get_pointer_path(arc, 'src')]), 'name'),
                                    "meta_type":core.get_attribute(core.get_meta_type(src_pt_metanode), 'name')
                                }
                            )
                graph[pt_id] = pt

        logger.info('Graph: {0}'.format(graph))
        
        classifications = list()    
        if IsFreeChoicePetriNet(graph) is True:
            classifications.append("Free Choice Petri Net")
        if IsStateMachine(graph) is True:
            classifications.append("State Machine")
        if IsMarkedGraph(graph) is True:
            classifications.append("Marked Graph")
        if IsWorkflowNet(graph) is True:
            classifications.append("Workflow Net")
        
        output = "Graph"
        if len(classifications) > 0:
            totalClassifications = len(classifications)
            output += ' met {0} classification(s): '.format(totalClassifications)
            if totalClassifications == 1:
                output += classifications[0]
            else:
                output += "; ".join(classifications)
        else:
            output += " did not meet any classifications"

        logger.info('Sending notification with output --> {0}'.format(output))
        self.send_notification(output)
        #self.add_file('ClassificationsCheck.txt', output)
