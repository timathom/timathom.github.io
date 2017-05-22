# Revised BibCitations proposal
## Working Draft, May 18, 2017 

## Introduction
Previous RareMat discussions had posited two general use cases for bibliographic citations: first, to identify a resource (as a subclass of bf:Identifier) and second, to support descriptive information (using the Web Annotation model). At the ArtFrame/RareMat in-person meeting held at Columbia, the consensus was that it would be problematic to model citations as identifiers and that a single pattern based on Web Annotations would be preferable.

The Web Annotation model provides a flexible framework for asserting relationships between two resources (the annotation body and the annotation target). Annotators are given considerable autonomy in defining the content of annotation bodies. The difficulty in modeling citations lies primarily in the structure of the citation itself. At the Columbia meeting, participants from ArtFrame drew attention to the role of bibliographic citations in resource collocation: for example, being able to identify and select all resources indexed in a standard reference source such as the English Short Title Catalog. Reference sources listed in the Standard Citation Forms database are typically cited using a controlled string that identifies the source (for example, "Wing") and a value (numeric, string, or mixed) that specifies the location within the source where the item being cataloged is described. Users should be able to query on both source and location.

## Proposals

### Web Annotation Model and Vocabulary
An additional motivation, ld4l:citing, should be created as a narrower term under oa:linking (or else oa:describing).

### Citation resources
See the RDF Turtle markup below for examples of these recommendations.

* Use the existing [`madsrdf:Source`](http://www.loc.gov/standards/mads/rdf/v1.html#Source) class (defined as "a type of citation") for citation resources. 
* Use the `madsrdf:citationSource` property to indicate the Standard Citation Form, if available; otherwise, a BIBFRAME or bibliotek-o title can be used. 
* Use the `madsrdf:citationStatus` property to indicate whether or not the described resource was found in the standard reference source.
* Create new named individuals for ld4l:found and ld4l:notFound in preference to the current MADSRDF practice of using the uncontrolled strings "found" and "not found."
* Use the `ld4l:atLocation` property to specify the location of a relevant entry or description within a reference source. The object of `ld4:atLocation` may be divided into multiple sublocations (ordered using `vivo:rank`) to accommodate hierarchical location designators: for example, "BM 15th cent., II, p. 498 (IB 8615)." 
* Use `bf:unit` to specify the appropriate unit for each designator.
* Create new named individuals for designators (such as "volume," "page," and "entry").
* If URIs were ever to be minted for entries in the Standard Citation Forms database, they could be linked to using `owl:sameAs` from the citation resource.
* A Work URI could be linked to using a property like `bf:references`.

* Questions:
  * Is this a valid use of `ld4l:atLocation`? My sense was it could be used abstractly to specify any kind of location.

### Examples in RDF

#### Example 1. Modeling the identifer use case with annotations.
```
ex:anno1  a                 oa:Annotation ;
        dcterms:creator     :rarematters
        oa:hasBody          [ a             oa:SpecificResource ;                              
                              oa:hasSource  ex:source1 ;                              
                              oa:hasPurpose ex:citing
                            ] ;
        oa:hasTarget        ex:instance1 ;
        oa:motivatedBy      oa:identifying .        
                
ex:source1  a              	madsrdf:Source ;
    	madsrdf:citationSource "Proctor, R. Index to the early printed books in the British Museum" ;
        madsrdf:citationStatus  ex:found ;
        ld4l:atLocation     [ a             prov:Location ;
                              bf:unit       ex:entry ;
                              rdf:value     "2383"                                  
                            ] ;
        owl:sameAs          <https://rbms.info/scf/?scf_entries=proctor-r-g-c-index-to-the-early-printed-books-in-the-british-museum> ;        
    	bf:references	  	<http://worldcat.org/entity/work/id/28799484> . 
    	
ex:instance1 a              bf:Instance ;
        dcterms:title       "Malleus maleficarum" .
```

#### Example 1.1 Modeling multipart citation locations
```
ex:citationX  ld4l:atLocation [ a             prov:Location ;
                                bf:hasPart    [ a             prov:Location ;
                                                bf:unit       ex:volume ;
                                                vivo:rank     "1" ;                                          
                                                rdf:value     "II"
                                              ] ,
                                              [ a             prov:Location ;
                                                bf:unit       ex:page ;
                                                vivo:rank     "2" ;                                          
                                                rdf:value     "498"                                           
                                              ] ,
                                              [ a             prov:Location ;
                                                bf:unit       ex:entry ;
                                                vivo:rank     "3" ;                                          
                                                rdf:value     "IB 8615"                                           
                                              ]                                                                                                     
                              ] .
```

#### Example 2. Modeling the descriptive information use case with annotations.
```
ex:anno2  a                 oa:Annotation ;
        dcterms:creator     :rarematters
        oa:hasBody          [ a             oa:SpecificResource ;                              
                              oa:hasSource  ex:source2 ;                         
                              oa:hasPurpose oa:commenting , ex:citing ;
                            ] ;
        oa:hasTarget        ex:instance2 ;
        oa:motivatedBy      oa:identifying .        
                
ex:source2  a              	madsrdf:Source ;
    	madsrdf:citationSource "Wing, D.G. Short-title catalogue of books printed in England, Scotland, Ireland, Wales, and British America, and of English books printed in other countries, 1641-1700 (2nd ed.)" ;
        madsrdf:citationStatus  ex:notFound ;
        madsrdf:citationNote "Not listed in Wing" ;
        owl:sameAs          <https://rbms.info/scf/?scf_entries=wing-d-g-short-title-catalogue-of-books-printed-in-england-scotland-ireland-wales-and-british-america-and-of-english-books-printed-in-other-countries-1641-1700-2nd-edition> ;
    	bf:references	  	<http://worldcat.org/entity/work/id/131317620> . 
    	
ex:instance2 a              bf:Instance ;
        dcterms:title       "Some title" .
```
