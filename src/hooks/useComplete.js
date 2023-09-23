import React, { useCallback } from 'react'
import useAlert from './useAlert'

/**
 * Usage:
 *
 * const showComplete = useComplete()
 * showComplete('something wrong')
 *
 * */

const useComplete = () => {
    const { triggerAlert } = useAlert()

    return useCallback(errorMessage => {
        triggerAlert({ type: 'completed', message: errorMessage })
    }, [])
}

export default useComplete
