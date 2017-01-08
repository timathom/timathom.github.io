<?xml version="1.0" encoding="UTF-8"?>
<!DOCTYPE rdf:RDF [
	<!ENTITY xsd 'http://www.w3.org/2001/XMLSchema#'>
	<!ENTITY xs 'http://www.w3.org/2001/XMLSchema#'>
	<!ENTITY xml 'http://www.w3.org/XML/1998/namespace#'>
	<!ENTITY aor 'http://libserv6.princeton.edu/aor#'>
	<!ENTITY skos "http://www.w3.org/2004/02/skos/core#" >
]>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xo="http://rhizomik.net/redefer/xsl/xsd2owl-functions.xsl"
    xmlns:xsd="http://www.w3.org/2001/XMLSchema"
    xmlns:rdf="http://www.w3.org/1999/02/22-rdf-syntax-ns#"
    xmlns:rdfs="http://www.w3.org/2000/01/rdf-schema#"
    xmlns:owl="http://www.w3.org/2002/07/owl#"
    xmlns:aor="http://libserv6.princeton.edu/aor#"
    xmlns:skos="http://www.w3.org/2004/02/skos/core#"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" exclude-result-prefixes="xs"
    version="2.0">

    <xsl:strip-space elements="*"/>

    <xsl:template match="/">
        <root>
            <xsl:apply-templates/>
        </root>
    </xsl:template>

    <xsl:template match="xs:element">
        <xsl:variable name="first">
            <xsl:value-of select="upper-case(substring(@name, 1, 1))"/>
        </xsl:variable>
        <xsl:variable name="rest">
            <xsl:value-of select="substring(@name, 2)"/>
        </xsl:variable>
        <xsl:variable name="whole">
            <xsl:value-of select="concat($first, $rest)"/>
        </xsl:variable>

        <owl:Class rdf:about="&aor;{$whole}">
            <rdfs:label xml:lang="en-us">
                <xsl:value-of select="$whole"/>
            </rdfs:label>
            <skos:editorialNote xml:lang="en"/>
            <rdfs:comment xml:lang="en-us"/>
        </owl:Class>

    </xsl:template>



</xsl:stylesheet>
