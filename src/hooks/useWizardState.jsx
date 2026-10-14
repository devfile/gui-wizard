import { createContext, useContext, useMemo, useReducer } from 'react'
import { WIZARD_STEPS } from '../utils/constants'
import { createInitialDevfileData } from '../utils/factories'

const WizardContext = createContext()

const LAST_STEP = WIZARD_STEPS.length - 1

const initialState = {
  currentStep: 0,
  completedSteps: [],
  devfileData: createInitialDevfileData()
}

export const WIZARD_ACTIONS = {
  NEXT_STEP: 'NEXT_STEP',
  PREV_STEP: 'PREV_STEP',
  GOTO_STEP: 'GOTO_STEP',
  MARK_STEP_COMPLETED: 'MARK_STEP_COMPLETED',
  UPDATE_METADATA: 'UPDATE_METADATA',
  UPDATE_EVENTS: 'UPDATE_EVENTS',
  SET_SECTION: 'SET_SECTION',
  ADD_ITEM: 'ADD_ITEM',
  UPDATE_ITEM: 'UPDATE_ITEM',
  REMOVE_ITEM: 'REMOVE_ITEM',
  MOVE_ITEM: 'MOVE_ITEM',
  RESET_WIZARD: 'RESET_WIZARD'
}

function withDevfileData(state, devfileData) {
  return { ...state, devfileData }
}

function wizardReducer(state, action) {
  switch (action.type) {
    case WIZARD_ACTIONS.NEXT_STEP:
      return {
        ...state,
        currentStep: Math.min(state.currentStep + 1, LAST_STEP),
        completedSteps: [...new Set([...state.completedSteps, state.currentStep])]
      }

    case WIZARD_ACTIONS.PREV_STEP:
      return { ...state, currentStep: Math.max(state.currentStep - 1, 0) }

    case WIZARD_ACTIONS.GOTO_STEP:
      return { ...state, currentStep: Math.min(Math.max(action.payload, 0), LAST_STEP) }

    case WIZARD_ACTIONS.MARK_STEP_COMPLETED:
      return { ...state, completedSteps: [...new Set([...state.completedSteps, action.payload])] }

    case WIZARD_ACTIONS.UPDATE_METADATA:
      return withDevfileData(state, {
        ...state.devfileData,
        metadata: { ...state.devfileData.metadata, ...action.payload }
      })

    case WIZARD_ACTIONS.UPDATE_EVENTS:
      return withDevfileData(state, {
        ...state.devfileData,
        events: { ...state.devfileData.events, ...action.payload }
      })

    case WIZARD_ACTIONS.SET_SECTION:
      return withDevfileData(state, {
        ...state.devfileData,
        [action.payload.section]: action.payload.value
      })

    case WIZARD_ACTIONS.ADD_ITEM:
      return withDevfileData(state, {
        ...state.devfileData,
        [action.payload.section]: [...state.devfileData[action.payload.section], action.payload.value]
      })

    case WIZARD_ACTIONS.UPDATE_ITEM:
      return withDevfileData(state, {
        ...state.devfileData,
        [action.payload.section]: state.devfileData[action.payload.section].map((item, index) =>
          index === action.payload.index ? action.payload.value : item
        )
      })

    case WIZARD_ACTIONS.REMOVE_ITEM:
      return withDevfileData(state, {
        ...state.devfileData,
        [action.payload.section]: state.devfileData[action.payload.section].filter(
          (_, index) => index !== action.payload.index
        )
      })

    case WIZARD_ACTIONS.MOVE_ITEM: {
      const { section, index, offset } = action.payload
      const items = state.devfileData[section]
      const target = index + offset

      if (target < 0 || target >= items.length) return state

      const reordered = [...items]
      ;[reordered[index], reordered[target]] = [reordered[target], reordered[index]]

      return withDevfileData(state, { ...state.devfileData, [section]: reordered })
    }

    case WIZARD_ACTIONS.RESET_WIZARD:
      return { ...initialState, devfileData: createInitialDevfileData() }

    default:
      return state
  }
}

export function WizardProvider({ children }) {
  const [state, dispatch] = useReducer(wizardReducer, initialState)

  const value = useMemo(() => ({ state, dispatch, actions: WIZARD_ACTIONS }), [state])

  return <WizardContext.Provider value={value}>{children}</WizardContext.Provider>
}

export function useWizard() {
  const context = useContext(WizardContext)
  if (!context) {
    throw new Error('useWizard must be used within WizardProvider')
  }
  return context
}

/**
 * Helpers for the array-shaped devfile sections (projects, components, ...).
 * `section` is a top-level key of `devfileData`.
 */
export function useSectionList(section) {
  const { state, dispatch } = useWizard()
  const items = state.devfileData[section]

  return {
    items,
    add: (value) => dispatch({ type: WIZARD_ACTIONS.ADD_ITEM, payload: { section, value } }),
    update: (index, value) => dispatch({ type: WIZARD_ACTIONS.UPDATE_ITEM, payload: { section, index, value } }),
    remove: (index) => dispatch({ type: WIZARD_ACTIONS.REMOVE_ITEM, payload: { section, index } }),
    move: (index, offset) => dispatch({ type: WIZARD_ACTIONS.MOVE_ITEM, payload: { section, index, offset } })
  }
}
