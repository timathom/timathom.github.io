<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
    xmlns:xs="http://www.w3.org/2001/XMLSchema" xmlns:local="local"
    exclude-result-prefixes="xs"
    version="2.0">
    
    <xsl:output method="text"/>
    
    <xsl:strip-space elements="*"/>
    
    <xsl:param 
        name="series" 
        select="'http://ivmooc-cobra2.github.io/cobra/series/1443'"/>
        
    <xsl:key name="about" match="span" use="@about"/>
            
    <xsl:key 
        name="geo" 
        match="span[@typeof = 'http://schema.org/GeoCoordinates']
               [span[@property eq 'http://schema.org/latitude'][. ne 'NULL']]" 
        use="@about"/>
    
    <xsl:template match="/">
        <xsl:text>var coords = [</xsl:text>
        <xsl:apply-templates 
            select="span/span[@about][contains(@typeof, 'http://comicmeta.org/cbo/Series')]"/>
        <xsl:text>];</xsl:text>
    </xsl:template>
    
    <xsl:template match="span[@about][contains(@typeof, 'http://comicmeta.org/cbo/Series')]">
        <xsl:apply-templates select="key('about', span[@rel eq 'http://purl.org/dc/terms/hasPart']/@resource)"/>      
        <xsl:if test="position() ne last()">            
            <xsl:text>, &#10;</xsl:text>
        </xsl:if>
    </xsl:template>
    
    <xsl:template 
        match="span
               [starts-with(@about, 'http://ivmooc-cobra2.github.io/cobra/issue/')]
               [key('geo', key('about', key('about', key('about', span[@rel eq 'http://purl.org/dc/terms/hasPart']/@resource)/span[@rel eq 'http://xmlns.com/foaf/0.1/maker']/@resource)/span[@rel eq 'http://schema.org/homeLocation']/@resource)/span[@rel eq 'http://schema.org/geo']/@resource)]
               ">
        <xsl:apply-templates 
            select="key('about', span[@rel eq 'http://purl.org/dc/terms/hasPart']/@resource)
            [key('geo', key('about', key('about', span[@rel eq 'http://xmlns.com/foaf/0.1/maker']/@resource)/span[@rel eq 'http://schema.org/homeLocation']/@resource)/span[@rel eq 'http://schema.org/geo']/@resource)]"/>
        
        <xsl:if test="position() ne last()">            
            <xsl:text>, &#10;</xsl:text>
        </xsl:if>
    </xsl:template>
    
    <xsl:template 
        match="span
               [starts-with(@about, 'http://ivmooc-cobra2.github.io/cobra/letter/')]
               [key('geo', key('about', key('about', span[@rel eq 'http://xmlns.com/foaf/0.1/maker']/@resource)/span[@rel eq 'http://schema.org/homeLocation']/@resource)/span[@rel eq 'http://schema.org/geo']/@resource)]
               ">
        
        <xsl:apply-templates 
            select="key('about', span[@rel eq 'http://xmlns.com/foaf/0.1/maker']/@resource)"/>
        
        <xsl:if test="position() ne last()">
            <xsl:text>, &#10;</xsl:text>
        </xsl:if>
    </xsl:template>
    
    <xsl:template 
        match="span
               [starts-with(@about, 'http://ivmooc-cobra2.github.io/cobra/fan/')]
               [span[@rel = 'http://schema.org/homeLocation']
               [key('geo', key('about', @resource)/*
               [@rel = 'http://schema.org/geo']/@resource)]]">
        
        <xsl:apply-templates 
            select="span[@rel = 'http://schema.org/homeLocation']"/>                
    </xsl:template>        
    
    
    <xsl:template 
        match="span[@rel = 'http://schema.org/homeLocation']
        [key('geo', key('about', @resource)/*
        [@rel = 'http://schema.org/geo']/@resource)]">
        
        <xsl:apply-templates 
            select="key('geo', key('about', @resource)/*
            [@rel = 'http://schema.org/geo']/@resource)"/>             
        <xsl:if test="position() ne last()">
            <xsl:text>, &#10;</xsl:text>
        </xsl:if>
    </xsl:template>        
    
    <xsl:template 
        match="span[@typeof = 'http://schema.org/GeoCoordinates']">
        <xsl:variable name="lat">
            <xsl:sequence 
                select="*[@property = 'http://schema.org/latitude']/string()"/>
        </xsl:variable>
        <xsl:variable name="lng">
            <xsl:sequence 
                select="*[@property = 'http://schema.org/longitude']/string()"/>
        </xsl:variable>
        
        <xsl:sequence select="
            (: new google.maps.LatLng(37.782551, -122.445368),:)
            (:concat('{lat: ', $lat, ', lng: ', $lng, '}'):)
            concat('new google.maps.LatLng(', $lat, ', ', $lng, ')')
            "/>       
    </xsl:template>
    
    <xsl:template match="node()|*|text()"/>
    
    <!--<xsl:template match="/">
        <xsl:text>var coords = [</xsl:text>
        
        <xsl:apply-templates 
            select="span/span[contains(@typeof, 'http://comicmeta.org/cbo/Fan')]
                    [span[@rel = 'http://schema.org/homeLocation']
                    [key('geo', key('about', @resource)/*
                    [@rel = 'http://schema.org/geo']/@resource)]]"/>                    
        
        <xsl:text>];</xsl:text>
    </xsl:template>      
    
    <xsl:template 
        match="span[contains(@typeof, 'http://comicmeta.org/cbo/Fan')]
               [span[@rel = 'http://schema.org/homeLocation']
               [key('geo', key('about', @resource)/*
               [@rel = 'http://schema.org/geo']/@resource)]]">                
        
        <xsl:apply-templates 
            select="span[@rel = 'http://schema.org/homeLocation']"/>
        
        <xsl:if test="position() ne last()">
            <xsl:text>, &#10;</xsl:text>
        </xsl:if>
    </xsl:template>
    
    <xsl:template 
        match="span[@rel = 'http://schema.org/homeLocation']
        [key('geo', key('about', @resource)/*
        [@rel = 'http://schema.org/geo']/@resource)]">
        
        <xsl:apply-templates 
            select="key('geo', key('about', @resource)/*
            [@rel = 'http://schema.org/geo']/@resource)">            
        </xsl:apply-templates>
        
        <xsl:if test="position() ne last()">
            <xsl:text>, &#10;</xsl:text>
        </xsl:if>
    </xsl:template>
    
    <xsl:template 
        match="span[@typeof = 'http://schema.org/GeoCoordinates']">
        <xsl:variable name="lat">
            <xsl:sequence 
                select="*[@property = 'http://schema.org/latitude']/string()"/>
        </xsl:variable>
        <xsl:variable name="lng">
            <xsl:sequence 
                select="*[@property = 'http://schema.org/longitude']/string()"/>
        </xsl:variable>
        
        <xsl:sequence select="
            concat('{lat: ', $lat, ', lng: ', $lng, '}')
            "/>       
    </xsl:template>-->
        
</xsl:stylesheet>