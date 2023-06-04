import React, { useState, useEffect, useCallback, useRef } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable, DataTableFilterMeta, DataTableOperatorFilterMetaData, DataTableFilterMetaData, DataTableStateEvent } from 'primereact/datatable';
import { Column, ColumnFilterElementTemplateOptions } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Dropdown, DropdownChangeEvent } from 'primereact/dropdown';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { MultiSelect, MultiSelectChangeEvent } from 'primereact/multiselect';
import { Toolbar } from 'primereact/toolbar';
import { FilterService } from 'primereact/api';
import { AutoComplete, AutoCompleteChangeEvent, AutoCompleteCompleteEvent } from 'primereact/autocomplete';

import RESOURCES, { RESOURCE_TYPES_ARRAY, ALL_TAGS, getColorOfTag, getLabelOfType, getColorOfType } from "../data";
import type { Resource, ResourceType } from "../data";

import "primereact/resources/themes/lara-light-indigo/theme.css"; // Theme
import "primereact/resources/primereact.min.css"; // Core
import "primeicons/primeicons.css"; // Icons


export default function ResourcesTable(): JSX.Element {
    const defaultFilters: DataTableFilterMeta = {
        global: { value: null, matchMode: FilterMatchMode.CONTAINS },
        url: { value: null, matchMode: FilterMatchMode.CONTAINS },
        description: { value: null, matchMode: FilterMatchMode.CONTAINS },
        type: { value: null, matchMode: FilterMatchMode.IN },
        tags: { operator: FilterOperator.OR, constraints: [{ value: null, matchMode: FilterMatchMode.CONTAINS }] }
    };

    const [filters, setFilters] = useState<DataTableFilterMeta>(defaultFilters);
    const [globalFilterValue, setGlobalFilterValue] = useState<string>("");
    const [selectedTags, setSelectedTags] = useState<Array<string>>([]);
    const [filteredTags, setFilteredTags] = useState<Array<string>>([]);

    useEffect(() => {
        FilterService.register("custom_tags", (rowTags: Array<string>, tag: string): boolean => rowTags.includes(tag));
    }, []);

    const resetFilters = () => {
        setFilters(defaultFilters);
        setGlobalFilterValue("");
        setSelectedTags([]);
    }

    function updateSelectedTags(newSelectedTags: Array<string>): void {
        setSelectedTags(newSelectedTags);

        if (newSelectedTags.length === 0) {
            setFilters({
                ...filters,
                tags: defaultFilters.tags
            });
        }
        else {
            setFilters({
                ...filters,
                tags: {
                    operator: FilterOperator.AND,
                    constraints: newSelectedTags.map((tag: string) => ({ value: tag, matchMode: FilterMatchMode.CUSTOM }))
                }
            });
        }
    }

    const onGlobalFilterChange: React.ChangeEventHandler<HTMLInputElement> = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.value;
        let _filters = { ...filters };

        (_filters["global"] as any).value = value;

        setFilters(_filters);
        setGlobalFilterValue(value);
    };

    const renderHeader = () => {
        return (
            <div className="flex justify-content-between">
                <Button type="button" icon="pi pi-filter-slash" label="Clear" outlined onClick={resetFilters} />
                <span className="p-input-icon-left">
                    <i className="pi pi-search" />
                    <InputText value={globalFilterValue} onChange={onGlobalFilterChange} placeholder="Keyword Search" />
                </span>
            </div>
        );
    };

    const tagsBodyTemplate = (row: Resource) => {
        return row.tags.map((tag: string) =>
            <Tag key={tag} value={tag} style={{background: getColorOfTag(tag)}} />
        );
    };

    const tagsFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return (
            <AutoComplete
                multiple value={selectedTags}
                suggestions={filteredTags}
                completeMethod={search}
                placeholder="Type tags here"
                onChange={(e: AutoCompleteChangeEvent) => updateSelectedTags(e.value)}
            />
        );
    };

    // TODO
    const tagsItemTemplate = (tag: string) => {
        return <Tag value={tag} style={{background: getColorOfTag(tag)}} />;
    };

    const typeBodyTemplate = ({ type }: Resource) => {
        return <Tag value={getLabelOfType(type)} style={{background: getColorOfType(type)}} />;
    }

    const typeFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return (
            <MultiSelect
                value={options.value}
                options={RESOURCE_TYPES_ARRAY}
                itemTemplate={(type: ResourceType) => <Tag value={type.label} style={{background: type.color}} />}
                onChange={(e: MultiSelectChangeEvent) => {options.filterApplyCallback(e.value)}}
                optionLabel="label"
                placeholder="Any"
                className="p-column-filter"
                maxSelectedLabels={4}
            />
        );
    };

    useEffect(() => {
        console.log("filters changed", filters);
    }, [filters]);

    const rightToolbarTemplate = () => {
        const href: string = `data:text/json;charset=utf-8,${encodeURIComponent(JSON.stringify(RESOURCES))}`;
        return (
            <a href={href} download="resources.json">
                <Button
                    label="Export JSON" icon="pi pi-upload"
                    className="p-button-help"
                />
            </a>
        );
    };

    const search = ({ query }: AutoCompleteCompleteEvent): void => {
        if (query.trim().length === 0) {
            setFilteredTags(ALL_TAGS);
        }
        else {
            setFilteredTags(ALL_TAGS.filter((tag: string) => tag.toLowerCase().startsWith(query.toLowerCase())));
        }
    }

    const header = renderHeader();

    return (
        <div className="card">
            <Toolbar className="mb-4" right={rightToolbarTemplate}></Toolbar>

            <DataTable
                value={RESOURCES} dataKey="url"
                header={header} showGridlines
                paginator rows={10}
                style={{ minWidth: '1000px' }}
                filters={filters} filterDisplay="row" globalFilterFields={["url", "description"]}
                onFilter={(e: DataTableStateEvent) => setFilters(e.filters)}
                emptyMessage="No resource found."
            >

                <Column
                    field="url" header="URL"
                    filter filterPlaceholder="Search by URL"
                    showFilterMenu={false}
                    style={{ minWidth: '12rem', width: '25%' }}
                />

                <Column
                    field="description" header="Description"
                    filter filterField='description'  filterPlaceholder="Search by description"
                    showFilterMenu={false}
                    style={{ minWidth: '14rem', width: '25%' }}
                />

                <Column
                    field="type" header="Type"
                    filter filterField="type" filterElement={typeFilterTemplate}
                    showFilterMenu={false}
                    body={typeBodyTemplate}
                    style={{ minWidth: '14rem', width: '25%' }}
                />

                <Column
                    field="tags" header="Tags"
                    filter filterField="tags" filterElement={tagsFilterTemplate}
                    showFilterMenu={false}
                    body={tagsBodyTemplate}
                    style={{ minWidth: '12rem', width: '25%' }}
                />
            </DataTable>
        </div>
    );
}
