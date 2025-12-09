import { useState, useContext } from "react";
import { CodePassContext } from '@contexts/CodepassContext'

const useFilterPass = () => {
    // [STATES]
    const [filterPass, setFilterPass] = useState('');
    const { setFilter, getFilter } = useContext(CodePassContext);
    // [FUNCTIONS]
    const updateFilter = (newFilter) => {
        if (newFilter !== filterPass && typeof newFilter === 'string' && newFilter.length >= 0) {
            setFilterPass(newFilter);
            setFilter(newFilter);
        }
    };
    const getCurrentFilter = () => {
        return getFilter();
    };
    // [HOOKS & STATES]
    return {
        filterPass, updateFilter, getCurrentFilter
    };
};

export { useFilterPass };