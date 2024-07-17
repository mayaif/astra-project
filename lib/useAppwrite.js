/** @format */
import { useState, useEffect } from "react";
import { Alert } from "react-native";
const useAppwrite = (fn) => {
  const [data, setData] = useState([]);
  const [isloading, setIsLoading] = useState(true);

  const fetchData = async () => {
    setIsLoading(true);
    try {
      const res = await fn();
      setData(res);
    } catch (error) {
      Alert.alert("Error", error.message);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const refetchData = () => fetchData();
  return { data, isloading, refetchData };
};

export default useAppwrite;
