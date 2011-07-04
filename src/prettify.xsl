<?xml version="1.0" encoding="utf-8"?>
<xsl:stylesheet xmlns:xsl="http://www.w3.org/1999/XSL/Transform" xmlns="http://www.w3.org/1999/xhtml" version="1.0">

    <xsl:output encoding="utf-8" method="text" indent="no"/>

    <xsl:template match="/">
        <xsl:apply-templates select="node()">
            <xsl:with-param name="indent" select="''"/>
        </xsl:apply-templates>
    </xsl:template>

    <xsl:template match="node()">
        <xsl:param name="indent"/>

        <xsl:value-of select="$indent"/>

        <xsl:text>&lt;</xsl:text><xsl:value-of select="name(.)"/><xsl:apply-templates select="@*"/>

            <xsl:if test="not(node())"><xsl:text> /</xsl:text></xsl:if>
        <xsl:text>&gt;</xsl:text>

        <xsl:if test="node()">

            <xsl:if test="node()[node()]">
<xsl:text>
</xsl:text>
            </xsl:if>

            <xsl:apply-templates>
                <xsl:with-param name="indent" select="concat($indent, '    ')"/>
            </xsl:apply-templates>


            <xsl:if test="node()[node()]">
                <xsl:value-of select="$indent"/>
            </xsl:if>

            <xsl:text>&lt;/</xsl:text><xsl:value-of select="name(.)"/><xsl:text>&gt;</xsl:text>
        </xsl:if>

<xsl:text>
</xsl:text>
    </xsl:template>

    <xsl:template match="@*">
        <xsl:text> </xsl:text>
        <xsl:value-of select="name(.)"/>
        <xsl:text>=</xsl:text>
        <xsl:value-of select="concat('&quot;', ., '&quot;')"/>
    </xsl:template>

    <xsl:template match="text()">
        <xsl:value-of select="normalize-space(.)"/>
    </xsl:template>

    <xsl:template match="comment()">
        <xsl:text>&lt;--</xsl:text><xsl:value-of select="."/><xsl:text>--&gt;</xsl:text>
    </xsl:template>

    <xsl:template match="processing-instruction()">
        <xsl:text>&lt;?</xsl:text><xsl:value-of select="name(.)"/><xsl:text> </xsl:text><xsl:value-of select="."/><xsl:text>?&gt;</xsl:text>
<xsl:text>
</xsl:text>
    </xsl:template>
</xsl:stylesheet>
