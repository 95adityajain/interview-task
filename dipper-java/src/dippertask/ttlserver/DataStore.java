/*
 * Represents DataStore contract.
 */
package dippertask.ttlserver;

/**
 *
 * @author adityajain
 */
public interface DataStore {
    
    Integer get(Integer key);
    
    String getAllInStringFormat();
    
    void set(Integer key, Integer val);
    
    void remove(Integer key);
    
    String contains(Integer key);
    
    void cleanUp();
}
