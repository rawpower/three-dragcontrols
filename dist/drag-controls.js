/*!
    * drag-controls
    * https://github.com/jbyte/three-dragcontrols
    * (c) 2018 @jbyte
    * Released under the MIT License.
    */
(function (global, factory) {
    typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
    typeof define === 'function' && define.amd ? define(factory) :
    (global.DragControls = factory());
}(this, (function () { 'use strict';

    function _classCallCheck(instance, Constructor) { if (!(instance instanceof Constructor)) { throw new TypeError("Cannot call a class as a function"); } }

    var THREE = void 0;
    var _plane = void 0;
    var _raycaster = void 0;
    var _mouse = void 0;
    var _offset = void 0;
    var _intersection = void 0;
    var _selected = void 0;
    var _hovered = void 0;

    var DragControls = function () {
        DragControls.install = function install(lib) {
            THREE = lib.THREE;
            _plane = new THREE.Plane();
            _raycaster = new THREE.Raycaster();
            _mouse = new THREE.Vector2();
            _offset = new THREE.Vector3();
            _intersection = new THREE.Vector3();
            _selected = null;
            _hovered = null;

            DragControls.prototype = Object.create(THREE.EventDispatcher.prototype);
        };

        function DragControls(objects, camera, domElement) {
            var _this = this;

            _classCallCheck(this, DragControls);

            this.objects = objects;
            this.enabled = true;
            this.camera = camera;
            this.domElement = domElement;
            var scope = this;

            this.activate = function () {
                if (!_this.domElement) {
                    console.log("Cannot activate the drag controls on a null DOM element");
                    return;
                }
                _this.domElement.addEventListener("mousedown", onDocumentMouseDown, false);
                _this.domElement.addEventListener("mousemove", onDocumentMouseMove, false);
                _this.domElement.addEventListener("mouseup", onDocumentMouseCancel, false);
                _this.domElement.addEventListener("mouseleave", onDocumentMouseCancel, false);
                _this.domElement.addEventListener("touchstart", onDocumentTouchStart, false);
                _this.domElement.addEventListener("touchmove", onDocumentTouchMove, false);
                _this.domElement.addEventListener("touchend", onDocumentTouchEnd, false);
            };

            this.deactivate = function () {
                if (!_this.domElement) {
                    console.log("Cannot deactivate the drag controls on a null DOM element");
                    return;
                }
                _this.domElement.removeEventListener("mousedown", onDocumentMouseDown, false);
                _this.domElement.removeEventListener("mousemove", onDocumentMouseMove, false);
                _this.domElement.removeEventListener("mouseup", onDocumentMouseCancel, false);
                _this.domElement.removeEventListener("mouseleave", onDocumentMouseCancel, false);
                _this.domElement.removeEventListener("touchstart", onDocumentTouchStart, false);
                _this.domElement.removeEventListener("touchmove", onDocumentTouchMove, false);
                _this.domElement.removeEventListener("touchend", onDocumentTouchEnd, false);
            };

            function onDocumentMouseDown(event) {
                event.preventDefault();

                _raycaster.setFromCamera(_mouse, scope.camera);

                var intersects = _raycaster.intersectObjects(scope.objects);
                if (intersects.length > 0) {
                    _selected = intersects[0].object;
                    if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
                        _offset.copy(_intersection).sub(_selected.position);
                    }
                    scope.domElement.style.cursor = "move";
                    scope.dispatchEvent({ type: "dragstart", object: _selected });
                }
            }

            function onDocumentMouseMove(event) {
                event.preventDefault();

                var rect = scope.domElement.getBoundingClientRect();

                _mouse.x = (event.clientX - rect.left) / rect.width * 2 - 1;
                _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

                _raycaster.setFromCamera(_mouse, scope.camera);

                if (_selected && scope.enabled) {
                    if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
                        _selected.position.copy(_intersection.sub(_offset));
                    }

                    scope.dispatchEvent({ type: "drag", object: _selected });
                    return;
                }

                _raycaster.setFromCamera(_mouse, scope.camera);

                var intersects = _raycaster.intersectObjects(scope.objects);
                if (intersects.length > 0) {
                    var object = intersects[0].object;
                    _plane.setFromNormalAndCoplanarPoint(scope.camera.getWorldDirection(_plane.normal), object.position);

                    if (_hovered !== object) {
                        scope.dispatchEvent({ type: "hoveron", object: object });

                        scope.domElement.style.cursor = "pointer";
                        _hovered = object;
                    }
                } else {
                    if (_hovered !== null) {
                        scope.dispatchEvent({ type: "hoveroff", object: _hovered });

                        scope.domElement.style.cursor = "auto";
                        _hovered = null;
                    }
                }
            }

            function onDocumentMouseCancel(event) {
                event.preventDefault();

                if (_selected) {
                    scope.dispatchEvent({ type: "dragend", object: _selected });
                    _selected = null;
                }

                scope.domElement.style.cursor = "auto";
            }

            function onDocumentTouchStart(event) {
                event.preventDefault();
                event = event.changedTouches[0];

                var rect = scope.domElement.getBoundingClientRect();

                _mouse.x = (event.clientX - rect.left) / rect.width * 2 - 1;
                _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

                _raycaster.setFromCamera(_mouse, scope.camera);
                var intersects = _raycaster.intersectObjects(scope.objects);
                if (intersects.length > 0) {
                    _selected = intersects[0].object;
                    _plane.setFromNormalAndCoplanarPoint(scope.camera.getWorldDirection(_plane.normal), _selected.position);
                    if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
                        _offset.copy(_intersection).sub(_selected.position);
                    }
                    scope.domElement.style.cursor = "move";
                    scope.dispatchEvent({ type: "dragstart", object: _selected });
                }
            }

            function onDocumentTouchMove(event) {
                event.preventDefault();
                event = event.changedTouches[0];

                var rect = scope.domElement.getBoundingClientRect();

                _mouse.x = (event.clientX - rect.left) / rect.width * 2 - 1;
                _mouse.y = -((event.clientY - rect.top) / rect.height) * 2 + 1;

                _raycaster.setFromCamera(_mouse, scope.camera);
                if (_selected && scope.enabled) {
                    if (_raycaster.ray.intersectPlane(_plane, _intersection)) {
                        _selected.position.copy(_intersection.sub(_offset));
                    }
                    scope.dispatchEvent({ type: "drag", object: _selected });
                    return;
                }
            }

            function onDocumentTouchEnd(event) {
                event.preventDefault();

                if (_selected) {
                    scope.dispatchEvent({ type: "dragend", object: _selected });                _selected = null;
                }

                scope.domElement.style.cursor = "auto";
            }

            this.activate();
        }

        return DragControls;
    }();

    return DragControls;

})));
