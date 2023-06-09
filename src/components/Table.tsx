import React, { useState, useEffect } from 'react';
import { FilterMatchMode, FilterOperator } from 'primereact/api';
import { DataTable, DataTableFilterMeta, DataTableStateEvent } from 'primereact/datatable';
import { Column, ColumnFilterElementTemplateOptions } from 'primereact/column';
import { InputText } from 'primereact/inputtext';
import { Button } from 'primereact/button';
import { Tag } from 'primereact/tag';
import { MultiSelect, MultiSelectChangeEvent } from 'primereact/multiselect';
import { Toolbar } from 'primereact/toolbar';
import { FilterService } from 'primereact/api';
import { AutoComplete, AutoCompleteChangeEvent, AutoCompleteCompleteEvent } from 'primereact/autocomplete';
import { SelectButton, SelectButtonChangeEvent } from 'primereact/selectbutton';
import { Chips } from 'primereact/chips';

import RESOURCES, { RESOURCE_TYPES_ARRAY, ALL_TAGS, getColorOfTag, getLabelOfType, getColorOfType } from "../data";
import type { Resource, ResourceType } from "../data";

import "primereact/resources/themes/lara-light-indigo/theme.css"; // Theme
import "primereact/resources/primereact.min.css"; // Core
import "primeicons/primeicons.css"; // Icons
import ExternalLink from './ExternalLink';


function TypeBodyTemplate({ type }: Resource): JSX.Element {
    return <Tag value={getLabelOfType(type)} style={{background: getColorOfType(type)}} />;
}

function TagsBodyTemplate({ tags }: Resource): Array<JSX.Element> {
    return tags.map((tag: string) =>
        <Tag key={tag} value={tag} style={{background: getColorOfTag(tag)}} />
    );
};

function URLBodyTemplate({ url }: Resource): JSX.Element {
    return (
        <ExternalLink href={url}>{url}</ExternalLink>
    )
}

function TypeFilterTemplate(options: ColumnFilterElementTemplateOptions): JSX.Element {
    return (
        <MultiSelect
            value={options.value}
            options={RESOURCE_TYPES_ARRAY}
            itemTemplate={(type: ResourceType) => <Tag value={type.label} style={{background: type.color}} />}
            onChange={(e: MultiSelectChangeEvent) => {options.filterApplyCallback(e.value)}}
            optionLabel="label"
            placeholder="Any"
            className="p-column-filter"
            maxSelectedLabels={1}
        />
    );
};

function RightToolbarTemplate(): JSX.Element {
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
    const [tagsMatchOperator, setTagsMatchOperator] = useState<"And" | "Or">("Or");

    useEffect(() => {
        FilterService.register("custom_tags", (rowTags: Array<string>, tag: string): boolean => rowTags.includes(tag));
    }, []);

    function resetFilters(): void {
        setFilters(defaultFilters);
        setGlobalFilterValue("");
        setSelectedTags([]);
    }

    function searchTags({ query }: AutoCompleteCompleteEvent): void {
        if (query.trim().length === 0) {
            setFilteredTags(ALL_TAGS);
        }
        else {
            setFilteredTags(ALL_TAGS.filter((tag: string) => tag.toLowerCase().startsWith(query.toLowerCase())));
        }
    }

    useEffect((): void => {
        if (selectedTags.length === 0) {
            setFilters({
                ...filters,
                tags: defaultFilters.tags
            });
        }
        else {
            setFilters({
                ...filters,
                tags: {
                    operator: tagsMatchOperator === "And" ? FilterOperator.AND : FilterOperator.OR,
                    constraints: selectedTags.map((tag: string) => ({ value: tag, matchMode: FilterMatchMode.CUSTOM }))
                }
            });
        }
    }, [selectedTags, tagsMatchOperator]);

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

    const tagsFilterTemplate = (options: ColumnFilterElementTemplateOptions) => {
        return (
            <>
                <SelectButton
                    value={tagsMatchOperator}
                    onChange={(e: SelectButtonChangeEvent) => setTagsMatchOperator(e.value)} options={['And', 'Or']}
                />
                <AutoComplete
                    multiple value={selectedTags}
                    suggestions={filteredTags}
                    completeMethod={searchTags}
                    placeholder="Type tags here"
                    onChange={(e: AutoCompleteChangeEvent) => setSelectedTags(e.value)}
                />
            </>
        );
    };

    const header = renderHeader();

    return (
        <div className="card">
            <Toolbar className="mb-4" right={RightToolbarTemplate}></Toolbar>

            <DataTable
                id="main-table"
                value={RESOURCES} dataKey="url"
                header={header} showGridlines
                paginator rows={10}
                filters={filters} filterDisplay="row" globalFilterFields={["url", "description", "details"]}
                onFilter={(e: DataTableStateEvent) => setFilters(e.filters)}
                emptyMessage="No resource found."
            >

                <Column
                    field="url" header="URL"
                    filter filterPlaceholder="Search by URL"
                    body={URLBodyTemplate}
                    showFilterMenu={false}
                    style={{ width: '20%' }}
                />

                <Column
                    field="type" header="Type"
                    filter filterField="type" filterElement={TypeFilterTemplate}
                    showFilterMenu={false}
                    body={TypeBodyTemplate}
                    style={{ width: '10%' }}
                />

                <Column
                    field="description" header="Description"
                    filter filterField='description' filterPlaceholder="Search by description"
                    showFilterMenu={false}
                    style={{ width: '40%' }}
                />

                <Column
                    field="tags" header="Tags"
                    filter filterField="tags" filterElement={tagsFilterTemplate}
                    showFilterMenu={false}
                    body={TagsBodyTemplate}
                    style={{ width: '30%' }}
                />
            </DataTable>
        </div>
    );
}
