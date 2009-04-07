require 'test_helper'

class GraphsControllerTest < ActionController::TestCase
  test "should get index" do
    get :index
    assert_redirected_to "/session/new"
    # TODO: Actual tests are still missing. Now we just realize the
    # authorization works.
    #
    #assert_response :success
    #assert_not_nil assigns(:graphs)
  end

  test "should get new" do
    get :new
    assert_redirected_to "/session/new"
    #assert_response :success
  end

#  test "should create graph" do
#    assert_difference('Graph.count') do
#      post :create, :graph => { }
#    end
#
#    assert_redirected_to graph_path(assigns(:graph))
#  end

#  test "should show graph" do
#    get :show, :id => graphs(:paula_koivuniemi).id
#    assert_redirected_to "/session/new"
#    #assert_response :success
#  end

#  test "should get edit" do
#    get :edit, :id => graphs(:paula_koivuniemi).id
#    assert_redirected_to "/session/new"
#    #assert_response :success
#  end

#  test "should update graph" do
#    put :update, :id => graphs(:paula_koivuniemi).id, :graph => { }
#    assert_redirected_to "/session/new"
#    #assert_redirected_to graph_path(assigns(:graph))
#  end

#  test "should destroy graph" do
#    assert_difference('Graph.count', -1) do
#      delete :destroy, :id => graphs(:paula_koivuniemi).id
#    end
#
#    assert_redirected_to graphs_path
#  end
end
