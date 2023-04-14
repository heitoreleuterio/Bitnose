import { createSlice } from "@reduxjs/toolkit";

const searchSlice = createSlice({
    name: "search",
    initialState: { searchQuery: '', acceptedCountries: [] },
    reducers: {
        changeQuery(state, action) {
            state.searchQuery = action.payload;
        },
        addCountry(state, action) {
            if (!state.acceptedCountries.includes(action.payload))
                state.acceptedCountries.push(action.payload);
        },
        removeCountry(state, action) {
            const index = state.acceptedCountries.indexOf(action.payload);
            if (index != -1)
                state.acceptedCountries.splice(index, 1);
        }
    }
});

export const { changeQuery, addCountry, removeCountry } = searchSlice.actions;

export default searchSlice.reducer;