precision highp float;

attribute vec3 position;
attribute vec3 normal;
attribute vec2 uv;

uniform mat4 view;
uniform mat4 projection;
uniform mat4 worldViewProjection;

varying vec3 vNormal;
varying vec3 vPosition;

varying vec2 vUV;

#include<bonesDeclaration>
#include<instancesDeclaration>

void main() {
    vec3 positionUpdated = position;

    vUV = uv;

    #include<instancesVertex>
    #include<bonesVertex>

    vec4 worldPos = finalWorld * vec4(positionUpdated, 1.0);
    vNormal = normalize(vec3(finalWorld * vec4(normal, 0.0)));
    vPosition = worldPos.xyz;

    gl_Position = projection * view * worldPos;
}