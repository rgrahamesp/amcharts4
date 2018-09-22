/**
 * Defines Pyramid Series.
 */
import * as tslib_1 from "tslib";
/**
 * ============================================================================
 * IMPORTS
 * ============================================================================
 * @hidden
 */
import { FunnelSeries, FunnelSeriesDataItem } from "./FunnelSeries";
import { registry } from "../../core/Registry";
import * as $type from "../../core/utils/Type";
import * as $utils from "../../core/utils/Utils";
import { percent } from "../../core/utils/Percent";
/**
 * ============================================================================
 * DATA ITEM
 * ============================================================================
 * @hidden
 */
//@todo: sequenced?
/**
 * Defines a [[DataItem]] for [[PyramidSeries]].
 *
 * @see {@link DataItem}
 */
var PyramidSeriesDataItem = /** @class */ (function (_super) {
    tslib_1.__extends(PyramidSeriesDataItem, _super);
    /**
     * Constructor
     */
    function PyramidSeriesDataItem() {
        var _this = _super.call(this) || this;
        _this.className = "PyramidSeriesDataItem";
        _this.applyTheme();
        return _this;
    }
    return PyramidSeriesDataItem;
}(FunnelSeriesDataItem));
export { PyramidSeriesDataItem };
/**
 * ============================================================================
 * MAIN CLASS
 * ============================================================================
 * @hidden
 */
/**
 * Defines [[Series]] for a FunnelSlice series on a Funnel chart.
 *
 * @see {@link IPyramidSeriesEvents} for a list of available Events
 * @see {@link IPyramidSeriesAdapters} for a list of available Adapters
 * @todo Example
 * @important
 */
var PyramidSeries = /** @class */ (function (_super) {
    tslib_1.__extends(PyramidSeries, _super);
    /**
     * Constructor
     */
    function PyramidSeries() {
        var _this = _super.call(this) || this;
        _this.className = "PyramidSeries";
        _this.topWidth = percent(0);
        _this.bottomWidth = percent(100);
        _this.valueIs = "area";
        _this.sliceLinks.template.width = 0;
        _this.sliceLinks.template.height = 0;
        _this.applyTheme();
        return _this;
    }
    /**
     * Sets defaults that instantiate some objects that rely on parent, so they
     * cannot be set in constructor.
     */
    PyramidSeries.prototype.applyInternalDefaults = function () {
        _super.prototype.applyInternalDefaults.call(this);
        if (!$type.hasValue(this.readerTitle)) {
            this.readerTitle = this.language.translate("Pyramid Series");
        }
    };
    /**
     * Returns a new/empty DataItem of the type appropriate for this object.
     *
     * @see {@link DataItem}
     * @return {PyramidSeriesDataItem} Data Item
     */
    PyramidSeries.prototype.createDataItem = function () {
        return new PyramidSeriesDataItem();
    };
    /**
     * (Re)validates the whole series, effectively causing it to redraw.
     *
     * @ignore Exclude from docs
     */
    PyramidSeries.prototype.validate = function () {
        _super.prototype.validate.call(this);
        this._nextWidth = undefined;
    };
    /**
     * [getNextValue description]
     *
     * @todo Description
     * @param  {FunnelSeriesDataItem} dataItem [description]
     * @return {number}                        [description]
     */
    PyramidSeries.prototype.getNextValue = function (dataItem) {
        var index = dataItem.index;
        var nextValue = dataItem.getWorkingValue("value");
        if (index < this.dataItems.length - 1) {
            var nextItem = this.dataItems.getIndex(index + 1);
            nextValue = nextItem.getWorkingValue("value");
        }
        if (nextValue == 0) {
            nextValue = 0.000001;
        }
        return nextValue;
    };
    /**
     * [validateDataElements description]
     *
     * @todo Description
     * @ignore Exclude from docs
     */
    PyramidSeries.prototype.validateDataElements = function () {
        var maxWidth = this.slicesContainer.innerWidth;
        var maxHeight = this.slicesContainer.innerHeight;
        this.dataItems.each(function (dataItem) {
            var relValue = dataItem.getWorkingValue("value") / dataItem.value;
            var sliceLink = dataItem.sliceLink;
            maxHeight -= (sliceLink.pixelHeight * relValue);
            maxWidth -= (sliceLink.pixelWidth * relValue);
        });
        this._pyramidHeight = maxHeight;
        this._pyramidWidth = maxWidth;
        _super.prototype.validateDataElements.call(this);
    };
    /**
     * [decorateSlice description]
     *
     * @todo Description
     * @param {this["_dataItem"]} dataItem [description]
     */
    PyramidSeries.prototype.decorateSlice = function (dataItem) {
        var slice = dataItem.slice;
        var sliceLink = dataItem.sliceLink;
        var label = dataItem.label;
        var nextValue = this.getNextValue(dataItem);
        var workingValue = dataItem.getWorkingValue("value");
        if (workingValue == 0) {
            workingValue = 0.000001;
        }
        var pyramidWidth = this._pyramidWidth;
        var pyramidHeight = this._pyramidHeight;
        var maxWidth = this.slicesContainer.innerWidth;
        var maxHeight = this.slicesContainer.innerHeight;
        var linkWidth = sliceLink.pixelWidth;
        var linkHeight = sliceLink.pixelHeight;
        if (this.orientation == "vertical") {
            var topWidth = $utils.relativeToValue(this.topWidth, maxWidth);
            if (!$type.isNumber(this._nextWidth)) {
                this._nextWidth = topWidth;
            }
            var bottomWidth = $utils.relativeToValue(this.bottomWidth, maxWidth);
            var sliceTopWidth = this._nextWidth;
            var angle = Math.atan2(pyramidHeight, topWidth - bottomWidth);
            var c = Math.tan(Math.PI / 2 - angle);
            if (c == 0) {
                c = 0.00000001;
            }
            var sliceHeight = void 0;
            var sliceBottomWidth = void 0;
            if (this.valueIs == "area") {
                var totalSquare = (topWidth + bottomWidth) / 2 * pyramidHeight;
                var square = totalSquare * workingValue / this.dataItem.values.value.sum;
                sliceHeight = (sliceTopWidth - Math.sqrt(sliceTopWidth * sliceTopWidth - 2 * square * c)) / c;
                sliceBottomWidth = (2 * square - sliceHeight * sliceTopWidth) / sliceHeight;
            }
            else {
                sliceHeight = pyramidHeight * workingValue / this.dataItem.values.value.sum;
                sliceBottomWidth = sliceTopWidth - sliceHeight * c;
            }
            slice.height = sliceHeight;
            slice.bottomWidth = sliceBottomWidth;
            slice.topWidth = sliceTopWidth;
            sliceLink.topWidth = slice.bottomWidth;
            sliceLink.bottomWidth = slice.bottomWidth;
            slice.y = this._nextY;
            slice.x = maxWidth / 2;
            label.x = slice.x;
            label.y = slice.pixelY + slice.pixelHeight / 2;
            this._nextY += slice.pixelHeight + linkHeight * workingValue / dataItem.value;
            sliceLink.y = this._nextY - linkHeight;
            sliceLink.x = slice.x;
        }
        else {
            var topWidth = $utils.relativeToValue(this.topWidth, maxHeight);
            if (!$type.isNumber(this._nextWidth)) {
                this._nextWidth = topWidth;
            }
            var bottomWidth = $utils.relativeToValue(this.bottomWidth, maxHeight);
            var sliceTopWidth = this._nextWidth;
            var angle = Math.atan2(pyramidWidth, topWidth - bottomWidth);
            var c = Math.tan(Math.PI / 2 - angle);
            if (c == 0) {
                c = 0.00000001;
            }
            var sliceWidth = void 0;
            var sliceBottomWidth = void 0;
            if (this.valueIs == "area") {
                var totalSquare = (topWidth + bottomWidth) / 2 * pyramidWidth;
                var square = totalSquare * workingValue / this.dataItem.values.value.sum;
                sliceWidth = (sliceTopWidth - Math.sqrt(sliceTopWidth * sliceTopWidth - 2 * square * c)) / c;
                sliceBottomWidth = (2 * square - sliceWidth * sliceTopWidth) / sliceWidth;
            }
            else {
                sliceWidth = pyramidWidth * workingValue / this.dataItem.values.value.sum;
                sliceBottomWidth = sliceTopWidth - sliceWidth * c;
            }
            slice.width = sliceWidth;
            slice.bottomWidth = sliceBottomWidth;
            slice.topWidth = sliceTopWidth;
            sliceLink.topWidth = slice.bottomWidth;
            sliceLink.bottomWidth = slice.bottomWidth;
            slice.x = this._nextY;
            slice.y = maxHeight / 2;
            label.y = slice.y;
            label.x = slice.pixelX + slice.pixelWidth / 2;
            this._nextY += slice.pixelWidth + linkWidth * workingValue / dataItem.value;
            sliceLink.x = this._nextY - linkWidth;
            sliceLink.y = slice.y;
        }
        this._nextWidth = slice.bottomWidth;
    };
    Object.defineProperty(PyramidSeries.prototype, "topWidth", {
        /**
         * @return {number | Percent}
         */
        get: function () {
            return this.getPropertyValue("topWidth");
        },
        /**
         * Width of the pyramid's tip in pixels or relative (`Percent`).
         *
         * `0%` (default) means the pyramid will be perfectly pointy.
         * `50%` will have a cut off / blunt top that is half the width of the chart.
         * `100%` will take the whole width of the chart.
         *
         * If you need the downward-pointing pyramid, you might want to `topWidth` to
         * `100%` and `bottomWidth` to `0%`.
         *
         * @default 0%
         * @param {number | Percent}
         */
        set: function (value) {
            if (this.setPropertyValue("topWidth", value)) {
                this.invalidateDataRange();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PyramidSeries.prototype, "bottomWidth", {
        /**
         * @return {number | Percent}
         */
        get: function () {
            return this.getPropertyValue("bottomWidth");
        },
        /**
         * Width of the pyramid's bottom (bsae) in pixels or relative (`Percent`).
         *
         * `0%` means the pyramid's botto will be pointy.
         * `50%` will have a cut off / blunt bottom that is half the width of the chart.
         * `100%` (default) will take the whole width of the chart.
         *
         * If you need the downward-pointing pyramid, you might want to `topWidth` to
         * `100%` and `bottomWidth` to `0%`.
         *
         * @param {number | Percent}
         */
        set: function (value) {
            if (this.setPropertyValue("bottomWidth", value)) {
                this.invalidateDataRange();
            }
        },
        enumerable: true,
        configurable: true
    });
    Object.defineProperty(PyramidSeries.prototype, "valueIs", {
        /**
         * @return {"area" | "height"}
         */
        get: function () {
            return this.getPropertyValue("valueIs");
        },
        /**
         * Indicates how slice's value will influence its size.
         *
         * `"area"` (default) means that the whole area of the pyramid (counting in
         * modifications by `topWidth` and `bottomWidth`) will be divvied up between
         * slices based on their value.
         *
         * With this setting at `"area"` the area of the trapezoids of each slice
         * will represent their value relatively to values of the other slices.
         *
         * This is a correct way to depict "weight" of each slice based on their
         * values.
         *
         * `"height"` means whole height (as opposed to area) of the pyramid will be
         * divvied up between slices. Actual slice width or area is not counted in.
         *
         * From the data-viz standpoint this does not make a lot of sense, since
         * slices with lesser values might appear more prominent if they are placed
         * towards thick end of the pyramid since their areas will be bigger.
         *
         * @default "area"
         * @param {"area" | "height"}
         */
        set: function (value) {
            if (this.setPropertyValue("valueIs", value)) {
                this.invalidateDataRange();
            }
        },
        enumerable: true,
        configurable: true
    });
    return PyramidSeries;
}(FunnelSeries));
export { PyramidSeries };
/**
 * bboxter class in system, so that it can be instantiated using its name from
 * anywhere.
 *
 * @ignore
 */
registry.registeredClasses["PyramidSeries"] = PyramidSeries;
registry.registeredClasses["PyramidSeriesDataItem"] = PyramidSeriesDataItem;
//# sourceMappingURL=PyramidSeries.js.map