import { useEffect, useState } from "react";
import api from "../services/api.js";

export default function useApi(path) {
  const [requestKey, setRequestKey] = useState(0);
  const [state, setState] = useState({
    path: null,
    requestKey: -1,
    loading: true,
    data: null,
    error: null,
  });

  useEffect(() => {
    let active = true;
    api
      .get(path)
      .then((response) => {
        if (active) {
          setState({
            path,
            requestKey,
            loading: false,
            data: response.data,
            error: null,
          });
        }
      })
      .catch((error) => {
        if (active) {
          setState({ path, requestKey, loading: false, data: null, error });
        }
      });

    return () => {
      active = false;
    };
  }, [path, requestKey]);

  return {
    ...state,
    loading:
      state.path !== path || state.requestKey !== requestKey || state.loading,
    reload: () => setRequestKey((current) => current + 1),
  };
}